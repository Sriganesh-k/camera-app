package main

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var minioClient *minio.Client
const bucketName = "photos"

func initMinIO() {
	var err error
	minioClient, err = minio.New("127.0.0.1:9000", &minio.Options{
		Creds:  credentials.NewStaticV4("minioadmin", "minioadmin", ""),
		Secure: false,
	})
	if err != nil {
		fmt.Println("Error initializing MinIO:", err)
	}
	fmt.Println("MinIO connected successfully!")
}

func uploadPhotoHandler(w http.ResponseWriter, r *http.Request) {
	group := r.FormValue("group")
	file, _, err := r.FormFile("photo")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	objectName := fmt.Sprintf("%s/%d.jpg", group, time.Now().Unix())
	_, err = minioClient.PutObject(context.Background(), bucketName, objectName, file, -1, minio.PutObjectOptions{})
	if err != nil {
		http.Error(w, "Failed to upload photo", http.StatusInternalServerError)
		return
	}

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"message": "Photo uploaded successfully"}`))
    
}

func listGroupsHandler(w http.ResponseWriter, r *http.Request) {
	groupSet := make(map[string]bool)
	objectCh := minioClient.ListObjects(context.Background(), bucketName, minio.ListObjectsOptions{Recursive: true})
	for object := range objectCh {
		if object.Err != nil {
			http.Error(w, "Error fetching groups", http.StatusInternalServerError)
			return
		}
		group := strings.Split(object.Key, "/")[0]
		groupSet[group] = true
	}

	groups := []string{}
	for group := range groupSet {
		groups = append(groups, group)
	}

	json.NewEncoder(w).Encode(groups)
}

func listPhotosHandler(w http.ResponseWriter, r *http.Request) {
	group := r.URL.Query().Get("group")
	if group == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	objectCh := minioClient.ListObjects(context.Background(), bucketName, minio.ListObjectsOptions{Prefix: group + "/", Recursive: true})
	photos := []string{}
	for object := range objectCh {
		if object.Err != nil {
			http.Error(w, "Error fetching photos", http.StatusInternalServerError)
			return
		}
		photos = append(photos, object.Key)
	}

	json.NewEncoder(w).Encode(photos)
}

func downloadGroupHandler(w http.ResponseWriter, r *http.Request) {
	group := r.URL.Query().Get("group")
	if group == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	zipBuffer := new(bytes.Buffer)
	zipWriter := zip.NewWriter(zipBuffer)

	objectCh := minioClient.ListObjects(context.Background(), bucketName, minio.ListObjectsOptions{Prefix: group + "/", Recursive: true})
	for object := range objectCh {
		if object.Err != nil {
			http.Error(w, "Error fetching photos", http.StatusInternalServerError)
			return
		}

		reader, err := minioClient.GetObject(context.Background(), bucketName, object.Key, minio.GetObjectOptions{})
		if err != nil {
			http.Error(w, "Error reading photo", http.StatusInternalServerError)
			return
		}
		defer reader.Close()

		writer, err := zipWriter.Create(object.Key)
		if err != nil {
			http.Error(w, "Error creating ZIP entry", http.StatusInternalServerError)
			return
		}
		io.Copy(writer, reader)
	}
	zipWriter.Close()

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s.zip\"", group))
	w.Write(zipBuffer.Bytes())
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusOK)
            return
        }
        next(w, r)
    }
}


func main() {
	initMinIO()

    http.HandleFunc("/upload", enableCORS(uploadPhotoHandler))
    http.HandleFunc("/groups", enableCORS(listGroupsHandler))
    http.HandleFunc("/photos", enableCORS(listPhotosHandler))
    http.HandleFunc("/download", enableCORS(downloadGroupHandler))
    

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
