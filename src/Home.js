import React, { useState } from "react";
import AddInstance from "./AddInstance";
import ClientPage from "./ClientPage";

function Home({ user }) {
  const [instances, setInstances] = useState(user.instances || []);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const selectedInstance = instances[selectedIndex];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar */}
      <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #ccc" }}>
        <AddInstance
          user={user}
          instances={instances}
          setInstances={setInstances}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
        />
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {!selectedInstance && <p>Select an instance to see its content.</p>}

        {selectedInstance && selectedInstance.type === "client" && (
          <ClientPage instance={selectedInstance} user={user} />
        )}

        {selectedInstance && selectedInstance.type === "sale" && (
          <p>Sale-based instance content coming soon!</p>
        )}
      </div>
    </div>
  );
}

export default Home;
