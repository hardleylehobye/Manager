import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function PersonalWealth({ user }) {
  const [wealth, setWealth] = useState({
    assets: [],
    liabilities: [],
    transactions: [],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ name: "", value: "" });
  const [newLiability, setNewLiability] = useState({ name: "", value: "" });
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchWealth = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.wealth) {
            setWealth(data.wealth);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchWealth();
  }, [user]);

  const saveWealth = async () => {
    if (user) {
      await setDoc(doc(db, "users", user.uid), { wealth }, { merge: true });
      setHasChanges(false);
      alert("Wealth data saved successfully!");
    }
  };

  const addAsset = () => {
    if (!newAsset.name || !newAsset.value) {
      alert("Please fill in all fields");
      return;
    }
    const asset = {
      id: Date.now().toString(),
      name: newAsset.name,
      value: parseFloat(newAsset.value),
      createdAt: new Date().toISOString(),
    };
    setWealth({ ...wealth, assets: [...wealth.assets, asset] });
    setNewAsset({ name: "", value: "" });
    setShowAssetForm(false);
    setHasChanges(true);
  };

  const addLiability = () => {
    if (!newLiability.name || !newLiability.value) {
      alert("Please fill in all fields");
      return;
    }
    const liability = {
      id: Date.now().toString(),
      name: newLiability.name,
      value: parseFloat(newLiability.value),
      createdAt: new Date().toISOString(),
    };
    setWealth({ ...wealth, liabilities: [...wealth.liabilities, liability] });
    setNewLiability({ name: "", value: "" });
    setShowLiabilityForm(false);
    setHasChanges(true);
  };

  const removeAsset = (id) => {
    setWealth({ ...wealth, assets: wealth.assets.filter(a => a.id !== id) });
    setHasChanges(true);
  };

  const removeLiability = (id) => {
    setWealth({ ...wealth, liabilities: wealth.liabilities.filter(l => l.id !== id) });
    setHasChanges(true);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setAnalyzing(true);

    try {
      if (file.type === "application/pdf") {
        await analyzePDFWithAI(file);
      } else if (file.name.endsWith('.csv')) {
        await analyzeCSV(file);
      } else {
        alert("Please upload a PDF or CSV file");
        setAnalyzing(false);
        return;
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      alert("Error analyzing file. Please try again.");
      setAnalyzing(false);
    }
  };

  const analyzePDFWithAI = async (file) => {
    try {
      // Convert PDF to base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      // Call Claude API to analyze the PDF
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64Data
                  }
                },
                {
                  type: "text",
                  text: `Analyze this bank statement and extract the following information in JSON format only (no markdown, no preamble):

{
  "totalIncome": <number>,
  "totalExpenses": <number>,
  "netSavings": <number>,
  "transactionCount": <number>,
  "categories": {
    "Food & Dining": <number>,
    "Transportation": <number>,
    "Housing": <number>,
    "Utilities": <number>,
    "Entertainment": <number>,
    "Shopping": <number>,
    "Healthcare": <number>,
    "Income": <number>,
    "Other": <number>
  },
  "transactions": [
    {
      "id": "<unique_id>",
      "date": "<date_string>",
      "description": "<description>",
      "amount": <number>,
      "type": "income" or "expense"
    }
  ],
  "topExpenseCategory": "<category_name>",
  "averageTransaction": <number>,
  "insights": [
    "<insight_1>",
    "<insight_2>",
    "<insight_3>"
  ]
}

Instructions:
- Extract all transactions from the statement
- Categorize each transaction appropriately
- Calculate totals accurately
- Positive amounts are income, negative are expenses
- Provide 3-5 actionable insights about spending patterns`
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        const text = data.content[0].text;
        
        // Remove any markdown code blocks if present
        const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        
        const analysisResult = JSON.parse(cleanText);
        
        setAnalysis(analysisResult);
        setWealth({ ...wealth, transactions: analysisResult.transactions || [] });
        setHasChanges(true);
      } else {
        throw new Error("Invalid response from AI");
      }

    } catch (error) {
      console.error("Error analyzing PDF:", error);
      alert("Error analyzing PDF. Please ensure it's a valid bank statement.");
    }
    
    setAnalyzing(false);
  };

  const analyzeCSV = async (file) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      const transactions = [];
      let totalIncome = 0;
      let totalExpenses = 0;
      const categories = {};

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',');
        if (columns.length < 3) continue;

        const date = columns[0]?.trim();
        const description = columns[1]?.trim();
        const amountStr = columns[2]?.trim().replace(/[^0-9.-]/g, '');
        const amount = parseFloat(amountStr);

        if (isNaN(amount)) continue;

        const transaction = {
          id: Date.now().toString() + i,
          date,
          description,
          amount,
          type: amount > 0 ? 'income' : 'expense',
        };

        transactions.push(transaction);

        if (amount > 0) {
          totalIncome += amount;
        } else {
          totalExpenses += Math.abs(amount);
        }

        const category = categorizeTransaction(description);
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category] += Math.abs(amount);
      }

      const analysisResult = {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        transactionCount: transactions.length,
        categories,
        topExpenseCategory: Object.keys(categories).reduce((a, b) => 
          categories[a] > categories[b] ? a : b, Object.keys(categories)[0]
        ),
        averageTransaction: (totalIncome + totalExpenses) / transactions.length,
        transactions,
        insights: generateInsights(totalIncome, totalExpenses, categories),
      };

      setAnalysis(analysisResult);
      setWealth({ ...wealth, transactions });
      setHasChanges(true);

    } catch (error) {
      console.error("Error parsing CSV:", error);
      alert("Error analyzing CSV. Please ensure it's in the correct format.");
    }

    setAnalyzing(false);
  };

  const categorizeTransaction = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant')) return 'Food & Dining';
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('transport')) return 'Transportation';
    if (desc.includes('rent') || desc.includes('mortgage')) return 'Housing';
    if (desc.includes('electric') || desc.includes('water') || desc.includes('utility')) return 'Utilities';
    if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('netflix')) return 'Entertainment';
    if (desc.includes('shop') || desc.includes('amazon') || desc.includes('store')) return 'Shopping';
    if (desc.includes('health') || desc.includes('medical') || desc.includes('pharmacy')) return 'Healthcare';
    if (desc.includes('salary') || desc.includes('payroll') || desc.includes('income')) return 'Income';
    return 'Other';
  };

  const generateInsights = (income, expenses, categories) => {
    const insights = [];
    const savingsRate = ((income - expenses) / income) * 100;
    
    if (savingsRate > 20) {
      insights.push(`Great job! You're saving ${savingsRate.toFixed(1)}% of your income.`);
    } else if (savingsRate < 0) {
      insights.push(`Warning: You're spending more than you earn. Consider reducing expenses.`);
    }
    
    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push(`Your highest expense category is ${topCategory[0]} at $${topCategory[1].toLocaleString()}.`);
    }
    
    return insights;
  };

  const totalAssets = wealth.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = wealth.liabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const tabStyle = (tabName) => ({
    padding: "10px 20px",
    backgroundColor: activeTab === tabName ? "#3498db" : "#f0f0f0",
    color: activeTab === tabName ? "#fff" : "#000",
    border: "none",
    borderRadius: "20px 20px 0 0",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: activeTab === tabName ? "bold" : "normal",
  });

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "20px" }}>💰 Personal Wealth</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "20px", borderBottom: "2px solid #3498db" }}>
        <button onClick={() => setActiveTab("overview")} style={tabStyle("overview")}>
          Overview
        </button>
        <button onClick={() => setActiveTab("statement")} style={tabStyle("statement")}>
          Bank Statement Analysis
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Net Worth Summary */}
          <div style={{
            padding: "30px",
            backgroundColor: "#f0f8ff",
            borderRadius: "15px",
            marginBottom: "30px",
            textAlign: "center",
            border: "2px solid #3498db",
          }}>
            <div style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Total Net Worth</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: netWorth >= 0 ? "#28a745" : "#e74c3c" }}>
              ${netWorth.toLocaleString()}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
              <div>
                <div style={{ fontSize: "12px", color: "#666" }}>Assets</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}>
                  ${totalAssets.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#666" }}>Liabilities</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#e74c3c" }}>
                  ${totalLiabilities.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Assets Section */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Assets</h3>
              <button
                onClick={() => setShowAssetForm(!showAssetForm)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {showAssetForm ? "Cancel" : "+ Add Asset"}
              </button>
            </div>

            {showAssetForm && (
              <div style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "1px solid #dee2e6",
              }}>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  placeholder="Asset name (e.g., Savings Account, Property)"
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
                  type="number"
                  value={newAsset.value}
                  onChange={(e) => setNewAsset({ ...newAsset, value: e.target.value })}
                  placeholder="Value"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={addAsset}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Add Asset
                </button>
              </div>
            )}

            {wealth.assets.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
                No assets yet
              </p>
            ) : (
              wealth.assets.map((asset) => (
                <div
                  key={asset.id}
                  style={{
                    padding: "15px",
                    marginBottom: "10px",
                    backgroundColor: "#fff",
                    border: "1px solid #dee2e6",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{asset.name}</div>
                    <div style={{ fontSize: "20px", color: "#28a745", fontWeight: "bold" }}>
                      ${asset.value.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAsset(asset.id)}
                    style={{
                      padding: "6px 12px",
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
              ))
            )}
          </div>

          {/* Liabilities Section */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>Liabilities</h3>
              <button
                onClick={() => setShowLiabilityForm(!showLiabilityForm)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {showLiabilityForm ? "Cancel" : "+ Add Liability"}
              </button>
            </div>

            {showLiabilityForm && (
              <div style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                marginBottom: "15px",
                border: "1px solid #dee2e6",
              }}>
                <input
                  type="text"
                  value={newLiability.name}
                  onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                  placeholder="Liability name (e.g., Loan, Credit Card)"
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
                  type="number"
                  value={newLiability.value}
                  onChange={(e) => setNewLiability({ ...newLiability, value: e.target.value })}
                  placeholder="Value"
                  style={{
                    width: "100%",
                    padding: "10px",
                    marginBottom: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={addLiability}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#e74c3c",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                  }}
                >
                  Add Liability
                </button>
              </div>
            )}

            {wealth.liabilities.length === 0 ? (
              <p style={{ color: "#666", textAlign: "center", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "10px" }}>
                No liabilities yet
              </p>
            ) : (
              wealth.liabilities.map((liability) => (
                <div
                  key={liability.id}
                  style={{
                    padding: "15px",
                    marginBottom: "10px",
                    backgroundColor: "#fff",
                    border: "1px solid #dee2e6",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{liability.name}</div>
                    <div style={{ fontSize: "20px", color: "#e74c3c", fontWeight: "bold" }}>
                      ${liability.value.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeLiability(liability.id)}
                    style={{
                      padding: "6px 12px",
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
              ))
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={saveWealth}
            disabled={!hasChanges}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: hasChanges ? "#28a745" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: hasChanges ? "pointer" : "not-allowed",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {hasChanges ? "💾 Save Changes" : "✓ Saved"}
          </button>
        </div>
      )}

      {/* Bank Statement Analysis Tab */}
      {activeTab === "statement" && (
        <div>
          {/* Upload Section */}
          <div style={{
            padding: "30px",
            backgroundColor: "#f8f9fa",
            borderRadius: "15px",
            border: "2px dashed #3498db",
            textAlign: "center",
            marginBottom: "30px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📊</div>
            <h3 style={{ marginTop: 0, marginBottom: "10px" }}>Upload Bank Statement</h3>
            <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
              Upload your bank statement (PDF or CSV) for AI-powered analysis
            </p>
            <input
              type="file"
              accept=".pdf,.csv"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              style={{
                display: "inline-block",
                padding: "12px 30px",
                backgroundColor: "#3498db",
                color: "white",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Choose File
            </label>
            {uploadedFile && (
              <div style={{ marginTop: "15px", fontSize: "14px", color: "#28a745" }}>
                ✓ {uploadedFile.name}
              </div>
            )}
          </div>

          {analyzing && (
            <div style={{
              padding: "40px",
              textAlign: "center",
              backgroundColor: "#f0f8ff",
              borderRadius: "15px",
              marginBottom: "30px",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "15px" }}>🤖</div>
              <div style={{ fontSize: "18px", fontWeight: "bold", color: "#3498db", marginBottom: "10px" }}>
                AI is analyzing your bank statement...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                This may take a few moments
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && !analyzing && (
            <div>
              <h3 style={{ marginBottom: "20px" }}>📈 Analysis Results</h3>

              {/* Summary Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                marginBottom: "30px",
              }}>
                <div style={{
                  padding: "20px",
                  backgroundColor: "#d4edda",
                  borderRadius: "10px",
                  border: "1px solid #28a745",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "12px", color: "#155724", marginBottom: "5px" }}>Total Income</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#28a745" }}>
                    ${analysis.totalIncome?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{
                  padding: "20px",
                  backgroundColor: "#f8d7da",
                  borderRadius: "10px",
                  border: "1px solid #e74c3c",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "12px", color: "#721c24", marginBottom: "5px" }}>Total Expenses</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#e74c3c" }}>
                    ${analysis.totalExpenses?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{
                  padding: "20px",
                  backgroundColor: "#d1ecf1",
                  borderRadius: "10px",
                  border: "1px solid #17a2b8",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "12px", color: "#0c5460", marginBottom: "5px" }}>Net Savings</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: analysis.netSavings >= 0 ? "#28a745" : "#e74c3c" }}>
                    ${analysis.netSavings?.toLocaleString() || 0}
                  </div>
                </div>

                <div style={{
                  padding: "20px",
                  backgroundColor: "#fff3cd",
                  borderRadius: "10px",
                  border: "1px solid #ffc107",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "12px", color: "#856404", marginBottom: "5px" }}>Transactions</div>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#ffc107" }}>
                    {analysis.transactionCount || 0}
                  </div>
                </div>
              </div>

              {/* Spending by Category */}
              {analysis.categories && Object.keys(analysis.categories).length > 0 && (
                <div style={{
                  padding: "25px",
                  backgroundColor: "#fff",
                  borderRadius: "15px",
                  border: "1px solid #dee2e6",
                  marginBottom: "30px",
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "20px" }}>Spending by Category</h4>
                  {Object.entries(analysis.categories)
                    .filter(([_, amount]) => amount > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => {
                      const percentage = (amount / analysis.totalExpenses) * 100;
                      return (
                        <div key={category} style={{ marginBottom: "15px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "bold" }}>{category}</span>
                            <span style={{ fontSize: "14px", color: "#666" }}>
                              ${amount.toLocaleString()} ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "8px",
                            backgroundColor: "#e9ecef",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: "100%",
                              backgroundColor: "#3498db",
                              borderRadius: "4px",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* AI Insights */}
              {analysis.insights && analysis.insights.length > 0 && (
                <div style={{
                  padding: "25px",
                  backgroundColor: "#e7f3ff",
                  borderRadius: "15px",
                  border: "1px solid #3498db",
                  marginBottom: "30px",
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: "15px" }}>🤖 AI Insights</h4>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {analysis.insights.map((insight, index) => (
                      <li key={index} style={{ marginBottom: "10px", fontSize: "14px" }}>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={saveWealth}
                style={{
                  width: "100%",
                  padding: "15px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                💾 Save Analysis
              </button>
            </div>
          )}

          {/* Instructions */}
          {!analysis && !analyzing && (
            <div style={{
              padding: "25px",
              backgroundColor: "#fff3cd",
              borderRadius: "15px",
              border: "1px solid #ffc107",
            }}>
              <h4 style={{ marginTop: 0, marginBottom: "15px" }}>📋 Supported Formats</h4>
              
              <div style={{ marginBottom: "20px" }}>
                <strong style={{ fontSize: "14px" }}>PDF Bank Statements:</strong>
                <p style={{ marginTop: "8px", marginBottom: "0", fontSize: "14px" }}>
                  Upload any PDF bank statement from your financial institution. AI will automatically extract and analyze all transactions, categorize spending, and provide personalized insights.
                </p>
              </div>

              <div>
                <strong style={{ fontSize: "14px" }}>CSV Format:</strong>
                <p style={{ marginTop: "8px", marginBottom: "10px", fontSize: "14px" }}>
                  Your CSV file should have these columns:
                </p>
                <ol style={{ paddingLeft: "20px", fontSize: "14px", marginBottom: "0" }}>
                  <li>Date (e.g., 2024-01-15)</li>
                  <li>Description (e.g., "Grocery Store")</li>
                  <li>Amount (e.g., -50.00 for expenses, 1000.00 for income)</li>
                  <li>Balance (optional)</li>
                </ol>
              </div>

              <div style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#e7f3ff",
                borderRadius: "10px",
                fontSize: "14px",
              }}>
                <strong>💡 Tip:</strong> Most banks allow you to download statements as PDF or CSV from their online banking portal. PDF analysis uses AI for better accuracy!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PersonalWealth;