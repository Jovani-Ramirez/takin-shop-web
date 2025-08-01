// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUbKYhapJaXz9QEhb6B55EGbYj7QOErrM",
  authDomain: "takin-inventario.firebaseapp.com",
  projectId: "takin-inventario",
  storageBucket: "takin-inventario.firebasestorage.app",
  messagingSenderId: "1092077269974",
  appId: "1:1092077269974:web:019ea8e4bf4037bd0eea77",
  measurementId: "G-FHT6SHFWZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


export { db };