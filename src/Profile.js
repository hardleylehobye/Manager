import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

function Profile({ user }) {
  const [customPhoto, setCustomPhoto] = useState("");
  const [photoInput, setPhotoInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load custom photo from Firestore when component mounts
  useEffect(() => {
    const loadCustomPhoto = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().customPhotoURL) {
            setCustomPhoto(docSnap.data().customPhotoURL);
          }
        } catch (error) {
          console.error("Error loading custom photo:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCustomPhoto();
  }, [user]);

  const handleSavePhoto = async () => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { customPhotoURL: photoInput }, { merge: true });
        setCustomPhoto(photoInput);
        setIsEditing(false);
        setPhotoInput("");
        alert("Profile photo updated!");
      } catch (error) {
        console.error("Error saving photo:", error);
        alert("Failed to update photo. Please try again.");
      }
    }
  };

  const displayPhoto = customPhoto || user.photoURL || "https://via.placeholder.com/150";

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginTop: 0, marginBottom: "30px" }}>👤 Profile</h2>

      {/* Profile Card */}
      <div style={{
        padding: "40px",
        backgroundColor: "#fff",
        borderRadius: "15px",
        border: "2px solid #f9a162",
        textAlign: "center",
        marginBottom: "30px",
      }}>
        <img
          src={displayPhoto}
          alt="Profile"
          style={{
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            border: "4px solid #f9a162",
            marginBottom: "20px",
            objectFit: "cover",
          }}
        />
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px",
              marginBottom: "20px",
            }}
          >
            Change Photo
          </button>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={photoInput}
              onChange={(e) => setPhotoInput(e.target.value)}
              placeholder="Paste image URL here"
              style={{
                width: "80%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "10px",
                fontSize: "12px",
              }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={handleSavePhoto}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setPhotoInput("");
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <h3 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
          {user.displayName || "User"}
        </h3>
        <p style={{ color: "#666", fontSize: "16px", marginBottom: "20px" }}>
          {user.email}
        </p>
        <div style={{
          display: "inline-block",
          padding: "8px 20px",
          backgroundColor: "#f0f8ff",
          borderRadius: "20px",
          fontSize: "14px",
          color: "#3498db",
        }}>
          Member since {new Date(user.metadata.creationTime).toLocaleDateString()}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginBottom: "30px",
        padding: "20px",
        backgroundColor: "#e7f3ff",
        borderRadius: "10px",
        border: "1px solid #3498db",
      }}>
        <div style={{ fontSize: "14px", color: "#2c3e50" }}>
          <strong>📸 How to use your LinkedIn photo:</strong>
          <ol style={{ marginTop: "10px", marginBottom: 0, paddingLeft: "20px" }}>
            <li>Go to your LinkedIn profile</li>
            <li>Right-click on your profile picture</li>
            <li>Select "Copy image address" or "Copy image link"</li>
            <li>Click "Change Photo" above and paste the URL</li>
          </ol>
        </div>
      </div>

      {/* Rest of profile content... */}
      <div style={{
        padding: "30px",
        backgroundColor: "#f8f9fa",
        borderRadius: "15px",
        border: "1px solid #dee2e6",
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Account Information</h3>
        
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Display Name</div>
          <div style={{
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            fontSize: "14px",
          }}>
            {user.displayName || "Not set"}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Email Address</div>
          <div style={{
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            fontSize: "14px",
          }}>
            {user.email}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>User ID</div>
          <div style={{
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            fontSize: "12px",
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}>
            {user.uid}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Email Verified</div>
          <div style={{
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            fontSize: "14px",
          }}>
            {user.emailVerified ? (
              <span style={{ color: "#28a745" }}>✓ Verified</span>
            ) : (
              <span style={{ color: "#e74c3c" }}>✗ Not Verified</span>
            )}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Last Sign In</div>
          <div style={{
            padding: "12px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            fontSize: "14px",
          }}>
            {new Date(user.metadata.lastSignInTime).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;