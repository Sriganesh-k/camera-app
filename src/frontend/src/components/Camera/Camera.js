import React, { useRef, useState, useEffect } from "react";

const Camera = () => {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [resolution, setResolution] = useState("640x480");
  const [group, setGroup] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const deviceInfos = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceInfos.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId); // Select the first device by default
        }
      } catch (error) {
        console.error("Error fetching devices:", error);
        setMessage("Unable to access camera devices.");
      }
    };

    fetchDevices();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      if (!selectedDevice) return;

      const [width, height] = resolution.split("x").map(Number);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDevice }, width, height },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the selected camera:", error);
        setMessage("Unable to access the selected camera.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [selectedDevice, resolution]);

  const handleCapture = async () => {
    if (!group) {
      setMessage("Please enter a group name before capturing.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const formData = new FormData();
        formData.append("group", group);
        formData.append("photo", blob, "captured.jpg");

        try {
          const response = await fetch("http://localhost:8080/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            setMessage("Captured successfully!");
          } else {
            setMessage("Failed to upload photo.");
          }
        } catch (error) {
          console.error("Error uploading photo:", error);
          setMessage("Error uploading photo.");
        }
      }
    }, "image/jpeg");

    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div>
      <div>
        <label>Group Name:</label>
        <input
          type="text"
          placeholder="Enter Group Name"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        />
      </div>

      <div>
        <label>Camera:</label>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
        >
          {devices.map((device, index) => (
            <option key={index} value={device.deviceId}>
              {device.label || `Camera ${index + 1}`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Resolution:</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option value="640x480">640x480</option>
          <option value="1280x720">1280x720</option>
          <option value="1920x1080">1920x1080</option>
        </select>
      </div>

      <div style={{ marginTop: "20px" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: "100%",
            maxWidth: "500px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleCapture}>Capture</button>
      </div>

      {message && <p style={{ color: message.includes("successfully") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default Camera;
