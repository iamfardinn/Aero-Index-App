import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCb99AS-UIstBI6iGpA-GntCeZRHqecIsA",
  authDomain: "aerocontext.firebaseapp.com",
  projectId: "aerocontext",
  storageBucket: "aerocontext.firebasestorage.app",
  messagingSenderId: "832101700685",
  appId: "1:832101700685:web:ab876812fe1b7355b67804",
  measurementId: "G-E96DSY59RB"
};

// Initialize Firebase only if it hasn't been initialized yet (fixes Fast Refresh crashes)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage for persistence across app restarts
// Only initialize Auth if it hasn't been initialized yet
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error: any) {
  // If it's already initialized (Fast Refresh), grab the existing instance
  if (error.code === 'auth/already-initialized') {
    const { getAuth } = require('firebase/auth');
    authInstance = getAuth(app);
  } else {
    throw error;
  }
}

export const auth = authInstance;
