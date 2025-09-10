// src/Login.js
import React from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function Login() {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <h1>Welcome to Your Personal Assistant</h1>
      <p>Your all-in-one solution for business and personal management.</p>
      <button
        onClick={handleGoogleSignIn}
        style={{
          backgroundColor: "#f9a162",
          padding: "12px 30px",
          borderRadius: "30px",
          border: "none",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
