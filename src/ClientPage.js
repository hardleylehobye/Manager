import React, { useState } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

function ClientPage({ instance, user, instances, setInstances, selectedIndex }) {
  const [activeTab, setActiveTab] = useState("description");
  
  // Description states
  const [description, setDescription] = useState(instance.description || "");
  const [research, setResearch] = useState(instance.research || "");
  const [implementation, setImplementation] = useState(instance.implementation || "");
  const [descriptionChanged, setDescriptionChanged] = useState(false);
  
  // Clients states
  const [clients, setClients] = useState(instance.clients || []);
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: ""
  });

  const saveToFirestore = async (updatedInstance) => {
    const updatedInstances = [...instances];
    updatedInstances[selectedIndex] = updatedInstance;
    setInstances(updatedInstances);
    
    if (user) {
      await setDoc(doc(db, "users", user.uid), { instances: updatedInstances }, { merge: true });
    }
  };

  const handleSaveDescription = async () => {
    const updated = { 
      ...instance, 
      description, 
      research, 
      implementation 
    };
    await saveToFirestore(updated);
    setDescriptionChanged(false);
    alert("Description saved successfully!");
  };

  const handleDescriptionChange = (field, value) => {
    setDescriptionChanged(true);
    if (field === "description") setDescription(value);
    if (field === "research") setResearch(value);
    if (field === "implementation") setImplementation(value);
  };

  const handleAddClient = async () => {
    if (!newClient.name.trim()) {
      alert("Please enter a client name");
      return;
    }

    const client = {
      id: Date.now().toString(),
      ...newClient,
      createdAt: new Date().toISOString(),
      finances: {
        totalRevenue: 0,
        totalExpenses: 0,
        invoices: [],
        payments: []
      }
    };

    const updatedClients = [...clients, client];
    setClients(updatedClients);
    const updated = { ...instance, clients: updatedClients };
    await saveToFirestore(updated);
    
    setNewClient({ name: "", email: "", phone: "", company: "", notes: "" });
    setShowClientForm(false);
    alert("Client added successfully!");
  };

  const handleRemoveClient = async (clientId) => {
    if (window.confirm("Remove this client?")) {
      const updatedClients = clients.filter(c => c.id !== clientId);
      setClients(updatedClients);
      const updated = { ...instance, clients: updatedClients };
      await saveToFirestore(updated);
      alert("Client removed successfully!");
    }
  };

  const tabStyle = (tabName) => ({
    padding: "10px 20px",
    backgroundColor: activeTab === tabName ? "#f9a162" : "#f0f0f0",
    color: activeTab === tabName ? "#000" : "#666",
    border: "none",
    borderRadius: "20px 20px 0 0",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: activeTab === tabName ? "bold" : "normal",
  });

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "20px" }}>{instance.name || "Unnamed Project"}</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "20px", borderBottom: "2px solid #f9a162" }}>
        <button onClick={() => setActiveTab("description")} style={tabStyle("description")}>
          Description
        </button>
        <button onClick={() => setActiveTab("business")} style={tabStyle("business")}>
          Run Business ({clients.length} clients)
        </button>
      </div>

      {/* Description Tab */}
      {activeTab === "description" && (
        <div>
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "10px" }}>Project Description</h3>
            <textarea
              value={description}
              onChange={(e) => handleDescriptionChange("description", e.target.value)}
              placeholder="Describe your project..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "10px" }}>Research</h3>
            <textarea
              value={research}
              onChange={(e) => handleDescriptionChange("research", e.target.value)}
              placeholder="Research notes, market analysis, competitor research..."
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "10px" }}>Implementation</h3>
            <textarea
              value={implementation}
              onChange={(e) => handleDescriptionChange("implementation", e.target.value)}
              placeholder="Implementation plan, milestones, tasks..."
              style={{
                width: "100%",
                minHeight: "150px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={handleSaveDescription}
            disabled={!descriptionChanged}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: descriptionChanged ? "#28a745" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: descriptionChanged ? "pointer" : "not-allowed",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {descriptionChanged ? "💾 Save Changes" : "✓ Saved"}
          </button>
        </div>
      )}

      {/* Run Business Tab */}
      {activeTab === "business" && (
        <div>
          {/* Clients Section */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Clients</h3>
              <button
                onClick={() => setShowClientForm(!showClientForm)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#f9a162",
                  color: "#000",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {showClientForm ? "Cancel" : "+ Add Client"}
              </button>
            </div>

            {showClientForm && (
              <div style={{ 
                padding: "20px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "10px", 
                marginBottom: "20px",
                border: "1px solid #dee2e6",
              }}>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Client name *"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="text"
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  placeholder="Company"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="Email"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="Phone"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <textarea
                  value={newClient.notes}
                  onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                  placeholder="Notes"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
                <button
                  onClick={handleAddClient}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Add Client
                </button>
              </div>
            )}

            <div>
              {clients.length === 0 ? (
                <p style={{ color: "#666", fontSize: "14px", textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
                  No clients yet. Add your first client to start running your business!
                </p>
              ) : (
                clients.map((client) => (
                  <div
                    key={client.id}
                    style={{
                      padding: "20px",
                      marginBottom: "15px",
                      backgroundColor: "#fff",
                      border: "1px solid #dee2e6",
                      borderRadius: "10px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "8px" }}>
                          {client.name}
                        </div>
                        {client.company && (
                          <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
                            🏢 {client.company}
                          </div>
                        )}
                        {client.email && (
                          <div style={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                            📧 {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div style={{ fontSize: "14px", color: "#555", marginBottom: "4px" }}>
                            📞 {client.phone}
                          </div>
                        )}
                        {client.notes && (
                          <div style={{ fontSize: "13px", color: "#777", marginTop: "10px", fontStyle: "italic" }}>
                            💭 {client.notes}
                          </div>
                        )}
                        
                        {/* Client Finances Preview */}
                        <div style={{ 
                          marginTop: "15px", 
                          padding: "10px", 
                          backgroundColor: "#f0f8ff", 
                          borderRadius: "8px",
                          display: "flex",
                          gap: "20px"
                        }}>
                          <div>
                            <div style={{ fontSize: "12px", color: "#666" }}>Revenue</div>
                            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#28a745" }}>
                              ${client.finances?.totalRevenue || 0}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "12px", color: "#666" }}>Expenses</div>
                            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#e74c3c" }}>
                              ${client.finances?.totalExpenses || 0}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: "12px", color: "#666" }}>Net</div>
                            <div style={{ fontSize: "16px", fontWeight: "bold", color: "#007bff" }}>
                              ${(client.finances?.totalRevenue || 0) - (client.finances?.totalExpenses || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveClient(client.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#e74c3c",
                          color: "white",
                          border: "none",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Financial Features Section */}
          <div>
            <h3 style={{ marginBottom: "15px" }}>Financial Tools</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "15px",
            }}>
              <div style={{ 
                padding: "20px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "10px",
                border: "1px solid #dee2e6",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>💰</div>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Invoices</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Create & track invoices</div>
              </div>
              
              <div style={{ 
                padding: "20px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "10px",
                border: "1px solid #dee2e6",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>💳</div>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Payments</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Record payments received</div>
              </div>
              
              <div style={{ 
                padding: "20px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "10px",
                border: "1px solid #dee2e6",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📊</div>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Reports</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Financial analytics</div>
              </div>
              
              <div style={{ 
                padding: "20px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "10px",
                border: "1px solid #dee2e6",
                textAlign: "center"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📈</div>
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Expenses</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Track business expenses</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPage;