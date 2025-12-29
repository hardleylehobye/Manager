import React from "react";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";

function Login() {
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Login successful:", result.user);
    } catch (error) {
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Ignore cancelled popup
      if (error.code === 'auth/cancelled-popup-request' || 
          error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      alert('Sign in failed: ' + error.message);
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