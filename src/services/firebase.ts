import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

// Default Demo Firebase Config (Users can override with .env variables if desired)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForCIPAMQuestSIH1384App",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "cipam-ip-quest.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "cipam-ip-quest",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "cipam-ip-quest.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109876543210",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109876543210:web:abcdef123456789"
};

// Initialize Firebase App instance singleton
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const db = getFirestore(app);
export { doc, setDoc, getDoc, onSnapshot, collection, query, where, getDocs, updateDoc };
