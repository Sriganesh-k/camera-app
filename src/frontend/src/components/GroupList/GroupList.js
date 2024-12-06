import React, { useState, useEffect } from "react";

const GroupList = ({ onGroupSelect, setActiveSection }) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:8080/groups");
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (group) => {
    onGroupSelect(group); // Pass the selected group to App
    setActiveSection("photos"); // Navigate to the photos section
  };

  return (
    <div>
      <h2>Groups</h2>
      <ul>
        {groups.map((group, index) => (
          <li
            key={index}
            onClick={() => handleGroupClick(group)}
            style={{ cursor: "pointer", color: "#0277bd" }}
          >
            {group}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
