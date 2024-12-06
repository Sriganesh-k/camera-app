import React, { useState, useEffect } from "react";

const PhotoPreview = ({ group, updateTrigger }) => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (group) {
      const fetchPhotos = async () => {
        try {
          const response = await fetch(`http://localhost:8080/photos?group=${group}`);
          const data = await response.json();
          setPhotos(data);
        } catch (error) {
          console.error("Error fetching photos:", error);
        }
      };

      fetchPhotos();
    }
  }, [group, updateTrigger]);

  const downloadGroupPhotos = () => {
    window.location.href = `http://localhost:8080/download?group=${group}`;
  };

  return (
    <div>
      {group && (
        <>
          <button onClick={downloadGroupPhotos}>Download All as ZIP</button>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
            {photos.map((photo, index) => (
              <img
                key={index}
                src={`http://localhost:9000/photos/${photo}`} // Construct the correct URL
                alt={`Photo ${index + 1}`}
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                }}
                onClick={() => window.open(`http://localhost:9000/photos/${photo}`, "_blank")} // Open full-size image in a new tab
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoPreview;
