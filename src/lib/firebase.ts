import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Production Firebase Project: courseai-platform-6f969
// Supports optional VITE_ environment overrides if custom keys are injected
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAxfZd05DdAtgB8fB39sXc603VJSsrOBKE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "courseai-platform-6f969.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "courseai-platform-6f969",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "courseai-platform-6f969.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "784511080607",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:784511080607:web:4a52c8ee69a48dadf4aaaa"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);
export const storage = getStorage(app);



