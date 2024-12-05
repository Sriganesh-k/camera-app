import React, { useState, useEffect } from "react";
import "./GroupList.css";

const GroupList = ({ onGroupSelect }) => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data))
      .catch((err) => console.error("Error fetching groups:", err));
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="group-list">
      <h2>Photo Groups</h2>
      <input
        type="text"
        placeholder="Search groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <ul>
        {filteredGroups.map((group) => (
          <li key={group} onClick={() => onGroupSelect(group)}>
            {group}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupList;
