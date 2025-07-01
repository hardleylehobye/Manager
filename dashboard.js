// Import Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAm1bjnb-mRQFZaBrS5qMqcG-kBr2jWlSU",
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

// DOM Elements
const userNameDisplay = document.getElementById('user-name');
const signoutLink = document.getElementById('signout-link-sidebar');
const plannerLink = document.getElementById('planner-link-sidebar');
const financesLink = document.getElementById('finances-link-sidebar');
const plannerSection = document.getElementById('planner');
const financesSection = document.getElementById('finances');

// Listen for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    userNameDisplay.textContent = `${user.displayName}`; // Example: "Hardley's Dashboard"
  } else {
    // If not signed in, redirect back to login page
    window.location.href = 'index.html';
  }
});

// Handle Signout
signoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      console.log('User signed out.');
      window.location.href = 'index.html'; // Redirect to login
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
});

// Handle Section Switching (Planner and Finances)
plannerLink.addEventListener('click', (e) => {
  e.preventDefault();
  plannerSection.style.display = 'block';
  financesSection.style.display = 'none';
});

financesLink.addEventListener('click', (e) => {
  e.preventDefault();
  financesSection.style.display = 'block';
  plannerSection.style.display = 'none';
});
