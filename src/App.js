import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastLogin: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error signing in or saving user:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f5f5 0%, #d6d1cc 60%, #f9a162 100%)",
        display: "flex",
        flexDirection: "column",
        color: "#000", // black text
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {!user ? (
        <>
          {/* Show heading and tagline only if NOT logged in */}
          <header style={{ textAlign: "center", padding: "20px 0" }}>
            <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
              Welcome to Your Personal Assistant
            </h1>
            <p style={{ fontSize: "1.2rem" }}>
              Your all-in-one solution for business and personal management. Organize, plan, and succeed with ease.
            </p>
          </header>
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <button
              onClick={handleGoogleSignIn}
              style={{
                backgroundColor: "#f9a162", // soft orange
                color: "#000",
                border: "none",
                padding: "12px 30px",
                fontSize: "1.2rem",
                borderRadius: "30px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(249, 161, 98, 0.5)",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e58b29")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f9a162")}
            >
              Sign in with Google
            </button>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", flex: 1 }}>
          {/* Sidebar */}
          <div
            style={{
              width: "220px",
              backgroundColor: "rgba(214, 209, 204, 0.6)", // semi-transparent warm grey
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              borderRight: "1px solid rgba(0,0,0,0.1)",
              color: "#000",
            }}
          >
            <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {user.displayName}
            </p>
            <button
              style={{
                backgroundColor: "#f9a162",
                color: "#000",
                border: "none",
                padding: "10px",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onClick={() => alert("Planner feature coming soon!")}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e58b29")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f9a162")}
            >
              Planner
            </button>
            <button
              style={{
                backgroundColor: "#f9a162",
                color: "#000",
                border: "none",
                padding: "10px",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onClick={() => alert("Business Finances coming soon!")}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e58b29")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f9a162")}
            >
              Business Finances
            </button>
            <button
              onClick={handleSignOut}
              style={{
                marginTop: "auto",
                backgroundColor: "#f9a162",
                color: "#000",
                border: "none",
                padding: "10px",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e58b29")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#f9a162")}
            >
              Sign Out
            </button>
          </div>

          {/* Main Content (Weekly Planner Placeholder) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "1.5rem",
              padding: "20px",
              color: "#000",
            }}
          >
            Weekly Planner (Coming Soon!)
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
