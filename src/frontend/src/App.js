import React, { useState } from "react";
import GroupList from "./components/GroupList/GroupList";
import PhotoPreview from "./components/PhotoPreview/PhotoPreview";
import Camera from "./components/Camera/Camera";
import "./App.css";

const App = () => {
  const [selectedGroup, setSelectedGroup] = useState("");

  return (
    <div className="app">
      <div className="card camera-section">
        <Camera />
      </div>
      <div className="content">
        <div className="card group-list-section">
          <GroupList onGroupSelect={setSelectedGroup} />
        </div>
        <div className="card photo-preview-section">
          <PhotoPreview group={selectedGroup} />
        </div>
      </div>
    </div>
  );
};

export default App;
