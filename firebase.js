
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

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

// Firebase Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
