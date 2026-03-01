// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "soez-food-delivery.firebaseapp.com",
  projectId: "soez-food-delivery",
  storageBucket: "soez-food-delivery.firebasestorage.app",
  messagingSenderId: "112968631728",
  appId: "1:112968631728:web:5bb60d6031a49b7a634275"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export {app, auth}