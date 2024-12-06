import React, { useState } from "react";
import Camera from "./components/Camera/Camera";
import GroupList from "./components/GroupList/GroupList";
import PhotoPreview from "./components/PhotoPreview/PhotoPreview";
import "./App.css";

const App = () => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [activeSection, setActiveSection] = useState("camera");

  return (
    <div className="app">
      {/* Navigation Menu */}
      <nav className="navbar">
        <ul>
          <li
            className={activeSection === "camera" ? "active" : ""}
            onClick={() => setActiveSection("camera")}
          >
            Camera
          </li>
          <li
            className={activeSection === "groups" ? "active" : ""}
            onClick={() => setActiveSection("groups")}
          >
            Groups
          </li>
          <li
            className={activeSection === "photos" ? "active" : ""}
            onClick={() => setActiveSection("photos")}
          >
            Photos
          </li>
        </ul>
      </nav>

      {/* Conditional Rendering Based on Active Section */}
      <div className="content">
        {activeSection === "camera" && (
          <div className="section">
            <Camera />
          </div>
        )}
        {activeSection === "groups" && (
          <div className="section">
            <GroupList
              onGroupSelect={setSelectedGroup}
              setActiveSection={setActiveSection}
            />
          </div>
        )}
        {activeSection === "photos" && (
          <div className="section">
            <PhotoPreview group={selectedGroup} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
