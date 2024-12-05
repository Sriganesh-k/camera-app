import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Camera.css";

const Camera = () => {
  const webcamRef = useRef(null);
  const [groupName, setGroupName] = useState("");

  const capturePhoto = async () => {
    if (!groupName) {
      alert("Please enter a group name!");
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    const blob = await fetch(imageSrc).then((res) => res.blob());

    const formData = new FormData();
    formData.append("group", groupName);
    formData.append("photo", blob, "photo.jpg");

    try {
      const response = await fetch("http://localhost:8080/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error during upload:", error);
      alert("An error occurred while uploading the photo.");
    }
  };

  return (
    <div className="camera">
      <h2>Take a Photo</h2>
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="camera-input"
      />
      <Webcam ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capturePhoto} className="camera-button">
        Capture Photo
      </button>
    </div>
  );
};

export default Camera;
