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
        background: "linear-gradient(135deg, #00f0ff 0%, #ff7e5f 100%)",
        display: "flex",
        flexDirection: "column",
        color: "#fff",
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
                backgroundColor: "#fff",
                color: "#00f0ff",
                border: "none",
                padding: "12px 30px",
                fontSize: "1.2rem",
                borderRadius: "30px",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0, 240, 255, 0.5)",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e0ffff")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
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
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              borderRight: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              {user.displayName}
            </p>
            <button
              style={{
                backgroundColor: "#fff",
                color: "#ff7e5f",
                border: "none",
                padding: "10px",
                borderRadius: "20px",
                cursor: "pointer",
              }}
              onClick={() => alert("Planner feature coming soon!")}
            >
              Planner
            </button>
            <button
              style={{
                backgroundColor: "#fff",
                color: "#ff7e5f",
                border: "none",
                padding: "10px",
                borderRadius: "20px",
                cursor: "pointer",
              }}
              onClick={() => alert("Business Finances coming soon!")}
            >
              Business Finances
            </button>
            <button
              onClick={handleSignOut}
              style={{
                marginTop: "auto",
                backgroundColor: "#fff",
                color: "#ff7e5f",
                border: "none",
                padding: "10px",
                borderRadius: "20px",
                cursor: "pointer",
              }}
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
