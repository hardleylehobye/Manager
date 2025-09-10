import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

function ClientPage({ instance: initialInstance, user }) {
  const [instance, setInstance] = useState(initialInstance || {});
  const [clients, setClients] = useState(initialInstance?.clients || []);
  const [payments, setPayments] = useState(initialInstance?.payments || []);
  const [newClient, setNewClient] = useState({ name: "", email: "", recurring: true });
  const [selectedClients, setSelectedClients] = useState([]);
  const [newColumn, setNewColumn] = useState("");
  const [search, setSearch] = useState("");
  const [paymentInput, setPaymentInput] = useState({});

  const saveInstance = async (updatedData) => {
    if (!user?.uid || !instance?.id) return;
    try {
      const docRef = doc(db, "users", user.uid, "instances", instance.id);
      const newInstance = { ...instance, ...updatedData };
      await setDoc(docRef, newInstance, { merge: true });
      setInstance(newInstance);
    } catch (err) {
      console.error("Failed to save instance:", err);
    }
  };

  // Effect to handle loading an existing instance or creating a new one
  useEffect(() => {
    const loadAndSetInstance = async () => {
      if (!user?.uid) return;

      // 1. If an initial instance ID is provided, try to load that instance from Firestore.
      if (initialInstance?.id) {
        try {
          const docRef = doc(db, "users", user.uid, "instances", initialInstance.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setInstance(data);
            setClients(data.clients || []);
            setPayments(data.payments || []);
          } else {
            console.warn("Instance not found in Firestore. Creating a new one.");
            // If the instance doesn't exist, save the initial state.
            await saveInstance({ ...initialInstance, id: initialInstance.id });
          }
        } catch (err) {
          console.error("Failed to load instance:", err);
        }
      } 
      // 2. If no ID is provided, it's a new instance. Generate a new ID and save it.
      else {
        const id = uuidv4();
        const newInstance = { ...initialInstance, id };
        setInstance(newInstance);
        await saveInstance(newInstance);
      }
    };

    loadAndSetInstance();
  }, [user?.uid, initialInstance?.id, saveInstance, initialInstance]);

  // Add new client
  const addClient = async () => {
    if (!newClient.name.trim()) return;
    const client = { id: uuidv4(), ...newClient, details: {} };
    const updatedClients = [...clients, client];
    setClients(updatedClients);
    setNewClient({ name: "", email: "", recurring: true });
    await saveInstance({ clients: updatedClients });
  };

  // Remove selected clients
  const removeSelectedClients = async () => {
    if (selectedClients.length === 0) return;
    const updatedClients = clients.filter((c) => !selectedClients.includes(c.id));
    setClients(updatedClients);
    setSelectedClients([]);
    await saveInstance({ clients: updatedClients });
  };

  const toggleSelect = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  // Add payment
  const addPayment = async (clientId) => {
    const amount = Number(paymentInput[clientId]);
    if (!amount) return;
    const month = new Date().toISOString().slice(0, 7);
    const payment = { clientId, amount, month, date: new Date().toISOString() };
    const updatedPayments = [...payments, payment];
    setPayments(updatedPayments);
    setPaymentInput({ ...paymentInput, [clientId]: "" });
    await saveInstance({ payments: updatedPayments });
  };

  // Add column
  const addColumn = (columnName) => {
    if (!columnName.trim()) return;
    const updatedClients = clients.map((c) => ({
      ...c,
      details: { ...c.details, [columnName]: "" },
    }));
    setClients(updatedClients);
    setNewColumn("");
    saveInstance({ clients: updatedClients });
  };

  // Update column detail
  const updateDetail = (clientId, column, value) => {
    const updatedClients = clients.map((c) =>
      c.id === clientId ? { ...c, details: { ...c.details, [column]: value } } : c
    );
    setClients(updatedClients);
    saveInstance({ clients: updatedClients });
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyPayments = payments.filter((p) => p.month === currentMonth);

  return (
    <div style={{ padding: "20px" }}>
      <h2>{instance.name || "New Instance"} (Client-based)</h2>

      {/* Add Client */}
      <div style={{ marginTop: "20px" }}>
        <h3>Add New Client</h3>
        <input
          placeholder="Name"
          value={newClient.name}
          onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={newClient.email}
          onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={newClient.recurring}
            onChange={(e) => setNewClient({ ...newClient, recurring: e.target.checked })}
          />
          Recurring
        </label>
        <button onClick={addClient}>Add Client</button>
      </div>

      {/* Add Column */}
      <div style={{ marginTop: "10px" }}>
        <input
          placeholder="New Column Name"
          value={newColumn}
          onChange={(e) => setNewColumn(e.target.value)}
        />
        <button onClick={() => addColumn(newColumn)}>Add Column</button>
      </div>

      {/* Search */}
      <div style={{ marginTop: "10px" }}>
        <input
          placeholder="Search client"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() =>
            alert(
              `Emails sent to: ${clients
                .filter((c) => selectedClients.includes(c.id))
                .map((c) => c.email)
                .join(", ")}`
            )
          }
          style={{ marginRight: "10px" }}
        >
          Send Email to Selected
        </button>
        <button onClick={removeSelectedClients} disabled={selectedClients.length === 0}>
          Remove Selected
        </button>
      </div>

      {/* Clients List */}
      <div
        style={{
          marginTop: "20px",
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <h3>Clients List</h3>
        <ul>
          {filteredClients.map((c) => (
            <li key={c.id} style={{ marginBottom: "10px" }}>
              <input
                type="checkbox"
                checked={selectedClients.includes(c.id)}
                onChange={() => toggleSelect(c.id)}
                style={{ marginRight: "5px" }}
              />
              <strong>{c.name}</strong> ({c.recurring ? "Recurring" : "One-time"})

              {Object.keys(c.details).map((col) => (
                <input
                  key={col}
                  placeholder={col}
                  value={c.details[col]}
                  onChange={(e) => updateDetail(c.id, col, e.target.value)}
                  style={{ marginLeft: "5px" }}
                />
              ))}

              <input
                type="number"
                placeholder="Amount"
                value={paymentInput[c.id] || ""}
                style={{ width: "80px", marginLeft: "5px" }}
                onChange={(e) => setPaymentInput({ ...paymentInput, [c.id]: e.target.value })}
              />
              <button onClick={() => addPayment(c.id)} style={{ marginLeft: "5px" }}>
                Add Payment
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Invoice */}
      <div style={{ marginTop: "20px" }}>
        <h3>Invoice for {currentMonth}</h3>
        {monthlyPayments.length === 0 ? (
          <p>No payments yet this month</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Client</th>
                {Object.keys(clients[0]?.details || {}).map((col) => (
                  <th key={col} style={{ border: "1px solid #ccc", padding: "5px" }}>
                    {col}
                  </th>
                ))}
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Amount</th>
                <th style={{ border: "1px solid #ccc", padding: "5px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {monthlyPayments.map((p, i) => {
                const client = clients.find((c) => c.id === p.clientId);
                return (
                  <tr key={i}>
                    <td style={{ border: "1px solid #ccc", padding: "5px" }}>{client?.name}</td>
                    {Object.keys(client?.details || {}).map((col) => (
                      <td key={col} style={{ border: "1px solid #ccc", padding: "5px" }}>
                        {client?.details[col] || "-"}
                      </td>
                    ))}
                    <td style={{ border: "1px solid #ccc", padding: "5px", textAlign: "right" }}>
                      {p.amount}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "5px", textAlign: "center" }}>
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: "bold", background: "#f9f9f9" }}>
                <td
                  colSpan={Object.keys(clients[0]?.details || {}).length + 1}
                  style={{ border: "1px solid #ccc", padding: "5px", textAlign: "right" }}
                >
                  Total
                </td>
                <td style={{ border: "1px solid #ccc", padding: "5px", textAlign: "right" }}>
                  {monthlyPayments.reduce((sum, p) => sum + p.amount, 0)}
                </td>
                <td style={{ border: "1px solid #ccc" }}></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ClientPage;