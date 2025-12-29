import React, { useState } from "react";
import AddInstance from "./AddInstance";
import ClientPage from "./ClientPage";
import PersonalWealth from "./PersonalWealth";
import GlobalFinances from "./GlobalFinances";
import Profile from "./Profile";

function Home({ user }) {
  const [instances, setInstances] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [currentView, setCurrentView] = useState("instances");

  const selectedInstance = instances[selectedIndex];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar */}
      <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        <AddInstance
          user={user}
          instances={instances}
          setInstances={setInstances}
          selectedIndex={selectedIndex}
          setSelectedIndex={setSelectedIndex}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        {currentView === "instances" && !selectedInstance && (
          <p>Select a project to see its content.</p>
        )}

        {currentView === "instances" && selectedInstance && selectedInstance.type === "client" && (
          <ClientPage 
            instance={selectedInstance} 
            user={user}
            instances={instances}
            setInstances={setInstances}
            selectedIndex={selectedIndex}
          />
        )}

        {currentView === "wealth" && (
          <PersonalWealth user={user} />
        )}

        {currentView === "global" && (
          <GlobalFinances user={user} instances={instances} />
        )}

        {currentView === "profile" && (
          <Profile user={user} />
        )}
      </div>
    </div>
  );
}

export default Home;