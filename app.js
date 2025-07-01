// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "manager-33ab0.firebaseapp.com",
  projectId: "manager-33ab0",
  storageBucket: "manager-33ab0.appspot.com",
  messagingSenderId: "908920126426",
  appId: "1:908920126426:web:11d8d305177ed087879ee3",
  measurementId: "G-8M21E9MXV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);  // Initialize Firestore

// DOM Elements
const googleSignInButton = document.getElementById('google-signin');
const signOutButton = document.getElementById('signout-button');
const signOutContainer = document.getElementById('signout-container');

// Function to check if the user exists in Firestore and add them if not
async function checkAndAddUser(user) {
  const userRef = doc(db, "users", user.uid);  // Reference to the user's document in Firestore

  // Check if the user already exists in Firestore
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    // User exists, redirect to the dashboard
    console.log("User exists, navigating to dashboard...");
    window.location.href = 'dashboard.html';
  } else {
    // User doesn't exist, add them to Firestore
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date(),  // You can track when the user signed up
      });
      console.log("New user added to Firestore");
      window.location.href = 'dashboard.html';  // Redirect to the dashboard page
    } catch (e) {
      console.error("Error adding user to Firestore: ", e);
    }
  }
}

// Sign In Function
googleSignInButton.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      // Check if the user exists in Firestore, if not, add them
      checkAndAddUser(user);
    })
    .catch((error) => {
      console.error('Error during Google Sign In:', error);
    });
});




