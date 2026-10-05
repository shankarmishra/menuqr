import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase Configuration supplied for MENUSQR
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAN5jHuF9OXUEB_oQj_Q4wb3lo_XBQGxxs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "menusqr-2f532.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "menusqr-2f532",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "menusqr-2f532.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "817554036783",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:817554036783:web:ee3dfb712c2012464a0eda",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-27Y6TC9XTE"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Analytics conditionally (only in browser environments where supported)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}
