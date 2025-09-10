import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function AddInstance({ user, instances, setInstances, selectedIndex, setSelectedIndex }) {
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
    const newInstance = { name: "", type: null }; // type null until chosen
    const updatedInstances = [newInstance, ...(Array.isArray(instances) ? instances : [])];
    setInstances(updatedInstances);
    setSelectedIndex(0);

    if (user) {
      await setDoc(doc(db, "users", user.uid), { instances: updatedInstances }, { merge: true });
    }
  };

  const setInstanceType = async (index, type) => {
    const updatedInstances = [...(Array.isArray(instances) ? instances : [])];
    updatedInstances[index].type = type;
    setInstances(updatedInstances);

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
        Add Instance
      </button>

      {safeInstances.map((instance, index) => (
        <div
          key={index}
          onClick={() => setSelectedIndex(index)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            cursor: "pointer",
            backgroundColor: selectedIndex === index ? "#e0d7cc" : "transparent",
            padding: "5px",
            borderRadius: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Name instance"
            value={instance.name}
            onChange={(e) => updateInstanceName(index, e.target.value)}
            style={{ padding: "5px", borderRadius: "10px", border: "1px solid #ccc" }}
          />

          {/* Only show type selection if type is not yet set */}
          {instance.type === null && (
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              <button
                onClick={() => setInstanceType(index, "client")}
                style={{
                  backgroundColor: "#3498db",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  cursor: "pointer",
                }}
              >
                Client-based
              </button>
              <button
                onClick={() => setInstanceType(index, "sale")}
                style={{
                  backgroundColor: "#e67e22",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "15px",
                  cursor: "pointer",
                }}
              >
                Sale-based
              </button>
            </div>
          )}

          {/* Show type if already set */}
          {instance.type !== null && (
            <small style={{ marginTop: "5px" }}>Type: {instance.type}</small>
          )}
        </div>
      ))}
    </div>
  );
}

export default AddInstance;
