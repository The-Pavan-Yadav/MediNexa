import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2YulXZka3Yk8ptvtOmCSf0xyILjGGqrI",
  authDomain: "mhd-hospital.firebaseapp.com",
  projectId: "mhd-hospital",
  storageBucket: "mhd-hospital.firebasestorage.app",
  messagingSenderId: "292842587519",
  appId: "1:292842587519:web:1f000fcae0908fc121864a",
  measurementId: "G-69946641V2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Analytics (only in supported environments)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { app, db, auth, analytics };
