import { initializeApp } from 'firebase/app';
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

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Auth with AsyncStorage for persistence across app restarts
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
