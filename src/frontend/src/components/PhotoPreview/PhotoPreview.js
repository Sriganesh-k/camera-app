import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import "./PhotoPreview.css";

const PhotoPreview = ({ group }) => {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    if (group) {
      fetch(`http://localhost:8080/photos?group=${group}`)
        .then((res) => res.json())
        .then((data) => setPhotos(data))
        .catch((err) => console.error("Error fetching photos:", err));
    }
  }, [group]);

  const downloadPhotos = () => {
    window.location.href = `http://localhost:8080/download?group=${group}`;
  };

  return (
    <div className="photo-preview">
      <h2>Photos in Group: {group}</h2>
      <button onClick={downloadPhotos} className="download-button">
        Download All as ZIP
      </button>
      <div className="photo-grid">
        {photos.map((photo) => (
          <img
            key={photo}
            src={`http://localhost:9000/photos/${photo}`}
            alt={photo}
            className="photo-thumbnail"
            onClick={() => setSelectedPhoto(`http://localhost:9000/photos/${photo}`)}
          />
        ))}
      </div>

      {/* Modal for Full Photo View */}
      <Modal show={selectedPhoto !== null} onClose={() => setSelectedPhoto(null)}>
        <img src={selectedPhoto} alt="Full View" className="full-photo" />
      </Modal>
    </div>
  );
};

export default PhotoPreview;
