import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./Login";
import Home from "./Home";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Current user:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

  console.log("Rendering:", user ? "Home" : "Login");
  return user ? <Home user={user} /> : <Login />;
}

export default App;