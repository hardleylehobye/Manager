import React from "react";

function GlobalFinances({ user, instances }) {
  // Calculate totals from all projects
  const calculateTotals = () => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalClients = 0;

    instances.forEach(instance => {
      if (instance.clients && Array.isArray(instance.clients)) {
        instance.clients.forEach(client => {
          totalClients++;
          if (client.finances) {
            totalRevenue += client.finances.totalRevenue || 0;
            totalExpenses += client.finances.totalExpenses || 0;
          }
        });
      }
    });

    return { totalRevenue, totalExpenses, totalClients };
  };

  const { totalRevenue, totalExpenses, totalClients } = calculateTotals();
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "20px" }}>📊 Global Finances</h2>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Overview of all your projects and their financial performance
      </p>

      {/* Overall Summary */}
      <div style={{
        padding: "30px",
        backgroundColor: "#f0f8ff",
        borderRadius: "15px",
        marginBottom: "30px",
        textAlign: "center",
        border: "2px solid #9b59b6",
      }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Total Net Profit</div>
        <div style={{ fontSize: "48px", fontWeight: "bold", color: netProfit >= 0 ? "#28a745" : "#e74c3c" }}>
          ${netProfit.toLocaleString()}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total Revenue</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
              ${totalRevenue.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total Expenses</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#e74c3c" }}>
              ${totalExpenses.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total Clients</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#3498db" }}>
              {totalClients}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Breakdown */}
      <h3 style={{ marginBottom: "15px" }}>Projects Breakdown</h3>
      {instances.length === 0 ? (
        <p style={{ color: "#666", textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
          No projects yet. Create a project to start tracking finances.
        </p>
      ) : (
        instances.map((instance, index) => {
          const projectRevenue = instance.clients?.reduce((sum, client) => 
            sum + (client.finances?.totalRevenue || 0), 0) || 0;
          const projectExpenses = instance.clients?.reduce((sum, client) => 
            sum + (client.finances?.totalExpenses || 0), 0) || 0;
          const projectNet = projectRevenue - projectExpenses;
          const clientCount = instance.clients?.length || 0;

          return (
            <div
              key={instance.id || index}
              style={{
                padding: "20px",
                marginBottom: "15px",
                backgroundColor: "#fff",
                border: "1px solid #dee2e6",
                borderRadius: "10px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "5px" }}>
                  {instance.name || "Unnamed Project"}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {clientCount} client{clientCount !== 1 ? "s" : ""}
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "15px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}>
                <div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Revenue</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#28a745" }}>
                    ${projectRevenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Expenses</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#e74c3c" }}>
                    ${projectExpenses.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Net Profit</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: projectNet >= 0 ? "#28a745" : "#e74c3c" }}>
                    ${projectNet.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Clients in this project */}
              {clientCount > 0 && (
                <div style={{ marginTop: "15px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#666" }}>
                    Clients:
                  </div>
                  {instance.clients.map(client => {
                    const clientNet = (client.finances?.totalRevenue || 0) - (client.finances?.totalExpenses || 0);
                    return (
                      <div
                        key={client.id}
                        style={{
                          padding: "10px",
                          marginBottom: "8px",
                          backgroundColor: "#fff",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: "14px" }}>{client.name}</div>
                        <div style={{
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: clientNet >= 0 ? "#28a745" : "#e74c3c"
                        }}>
                          ${clientNet.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default GlobalFinances;