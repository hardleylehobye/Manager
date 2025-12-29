import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

function AddInstance({ user, instances, setInstances, selectedIndex, setSelectedIndex, currentView, setCurrentView }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstances = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const arr = Array.isArray(data.instances) ? data.instances : [];
          setInstances(arr);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    fetchInstances();
  }, [user, setInstances]);

  const addInstance = async () => {
    const newInstance = { 
      id: Date.now().toString(),
      name: "", 
      type: "client",
      createdAt: new Date().toISOString(),
      clients: []
    };
    const updatedInstances = [newInstance, ...(Array.isArray(instances) ? instances : [])];
    setInstances(updatedInstances);
    setSelectedIndex(0);
    setCurrentView("instances");

    if (user) {
      await setDoc(doc(db, "users", user.uid), { instances: updatedInstances }, { merge: true });
    }
  };

  const updateInstanceName = async (index, value) => {
    const updatedInstances = [...(Array.isArray(instances) ? instances : [])];
    updatedInstances[index].name = value;
    setInstances(updatedInstances);

    if (user) {
      await setDoc(doc(db, "users", user.uid), { instances: updatedInstances }, { merge: true });
    }
  };

  if (loading) return <p>Loading...</p>;

  const safeInstances = Array.isArray(instances) ? instances : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Profile Section */}
      <div
        onClick={() => {
          setCurrentView("profile");
          setSelectedIndex(null);
        }}
        style={{
          padding: "15px",
          backgroundColor: currentView === "profile" ? "#e0d7cc" : "#f8f9fa",
          borderRadius: "15px",
          border: currentView === "profile" ? "2px solid #f9a162" : "1px solid #dee2e6",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src={user.photoURL || "https://via.placeholder.com/50"}
          alt="Profile"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "2px solid #f9a162",
          }}
        />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.displayName || "User"}
          </div>
          <div style={{ fontSize: "11px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {user.email}
          </div>
        </div>
      </div>

      <button
        onClick={async () => {
          await signOut(auth);
        }}
        style={{
          backgroundColor: "#e74c3c",
          color: "#fff",
          border: "none",
          padding: "10px",
          borderRadius: "20px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
        <button
          onClick={() => {
            setCurrentView("wealth");
            setSelectedIndex(null);
          }}
          style={{
            backgroundColor: currentView === "wealth" ? "#3498db" : "#f0f0f0",
            color: currentView === "wealth" ? "#fff" : "#000",
            border: "none",
            padding: "10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: currentView === "wealth" ? "bold" : "normal",
          }}
        >
          💰 Personal Wealth
        </button>

        <button
          onClick={() => {
            setCurrentView("global");
            setSelectedIndex(null);
          }}
          style={{
            backgroundColor: currentView === "global" ? "#9b59b6" : "#f0f0f0",
            color: currentView === "global" ? "#fff" : "#000",
            border: "none",
            padding: "10px",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: currentView === "global" ? "bold" : "normal",
          }}
        >
          📊 Global Finances
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #ccc", margin: "10px 0" }} />

      <h4 style={{ margin: "10px 0 5px 0", fontSize: "14px", color: "#666" }}>PROJECTS</h4>

      <button
        onClick={addInstance}
        style={{
          backgroundColor: "#f9a162",
          color: "#000",
          border: "none",
          padding: "10px",
          borderRadius: "20px",
          cursor: "pointer",
        }}
      >
        Add Project
      </button>

      {safeInstances.map((instance, index) => (
        <div
          key={instance.id || index}
          onClick={() => {
            setSelectedIndex(index);
            setCurrentView("instances");
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            cursor: "pointer",
            backgroundColor: currentView === "instances" && selectedIndex === index ? "#e0d7cc" : "transparent",
            padding: "10px",
            borderRadius: "10px",
            border: currentView === "instances" && selectedIndex === index ? "2px solid #f9a162" : "1px solid #ccc",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Project name"
              value={instance.name}
              onChange={(e) => updateInstanceName(index, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ 
                padding: "5px", 
                borderRadius: "10px", 
                border: "1px solid #ccc",
                flex: 1,
                marginRight: "10px"
              }}
            />
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (window.confirm("Remove this project?")) {
                  const updatedInstances = safeInstances.filter((_, i) => i !== index);
                  setInstances(updatedInstances);
                  if (selectedIndex === index) setSelectedIndex(null);
                  else if (selectedIndex > index) setSelectedIndex(selectedIndex - 1);
                  
                  if (user) {
                    await setDoc(doc(db, "users", user.uid), { instances: updatedInstances }, { merge: true });
                  }
                }
              }}
              style={{
                backgroundColor: "#e74c3c",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Remove
            </button>
          </div>
          <small style={{ color: "#666" }}>Project • {new Date(instance.createdAt).toLocaleDateString()}</small>
        </div>
      ))}
    </div>
  );
}

export default AddInstance;