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
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Global variables
var (
	minioClient *minio.Client
	db          *gorm.DB
)

const bucketName = "photos"

// Photo represents the schema for the database table
type Photo struct {
	ID        uint      `gorm:"primaryKey"`
	GroupName string    `gorm:"index"`
	FileName  string    `gorm:"unique"`
	CreatedAt time.Time
}

// Initialize MinIO
func initMinIO() {
	var err error
	minioClient, err = minio.New("127.0.0.1:9000", &minio.Options{
		Creds:  credentials.NewStaticV4("minioadmin", "minioadmin", ""),
		Secure: false,
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to initialize MinIO: %v", err))
	}

	// Create bucket if it doesn't exist
	err = minioClient.MakeBucket(context.Background(), bucketName, minio.MakeBucketOptions{})
	if err != nil && minio.ToErrorResponse(err).Code != "BucketAlreadyOwnedByYou" {
		panic(fmt.Sprintf("Failed to create bucket: %v", err))
	}

	fmt.Println("MinIO initialized successfully!")
}

// Initialize SQLite with GORM
func initDatabase() {
	var err error
	db, err = gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	// Auto-migrate the schema
	err = db.AutoMigrate(&Photo{})
	if err != nil {
		panic(fmt.Sprintf("Failed to migrate database schema: %v", err))
	}

	fmt.Println("Database initialized successfully!")
}

// Sanitize group names
func sanitizeGroupName(name string) string {
	return strings.ReplaceAll(name, " ", "_")
}

// Upload photo handler
func uploadPhotoHandler(w http.ResponseWriter, r *http.Request) {
	group := r.FormValue("group")
	group = sanitizeGroupName(group)

	file, _, err := r.FormFile("photo")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Generate object name and upload to MinIO
	objectName := fmt.Sprintf("%s/%d.jpg", group, time.Now().Unix())
	_, err = minioClient.PutObject(context.Background(), bucketName, objectName, file, -1, minio.PutObjectOptions{ContentType: "image/jpeg"})
	if err != nil {
		http.Error(w, "Failed to upload photo", http.StatusInternalServerError)
		return
	}

	// Save photo metadata to database
	photo := Photo{
		GroupName: group,
		FileName:  objectName,
		CreatedAt: time.Now(),
	}
	db.Create(&photo)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Photo uploaded successfully!")
}

// List groups handler
func listGroupsHandler(w http.ResponseWriter, r *http.Request) {
	var groups []string
	db.Model(&Photo{}).Distinct("group_name").Pluck("group_name", &groups)
	json.NewEncoder(w).Encode(groups)
}

// List photos handler
func listPhotosHandler(w http.ResponseWriter, r *http.Request) {
	group := r.URL.Query().Get("group")
	if group == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	var photos []Photo
	db.Where("group_name = ?", group).Find(&photos)

	// Extract file names to match MinIO paths
	photoPaths := []string{}
	for _, photo := range photos {
		photoPaths = append(photoPaths, photo.FileName)
	}

	json.NewEncoder(w).Encode(photoPaths)
}

// Download group photos as ZIP
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

// Enable CORS middleware
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
	initDatabase()

	http.HandleFunc("/upload", enableCORS(uploadPhotoHandler))
	http.HandleFunc("/groups", enableCORS(listGroupsHandler))
	http.HandleFunc("/photos", enableCORS(listPhotosHandler))
	http.HandleFunc("/download", enableCORS(downloadGroupHandler))

	fmt.Println("Server running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
