// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics } from 'firebase/analytics';
import { getPerformance, type FirebasePerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let performance: FirebasePerformance | null = null;

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.error(
    "**********************************************************************************************************************\n" +
    "IMPORTANT: Firebase API Key is missing or is still set to the placeholder 'YOUR_API_KEY'.\n" +
    "Please update your .env file with your actual Firebase project credentials for 'NEXT_PUBLIC_FIREBASE_API_KEY'.\n" +
    "Firebase will not be initialized, and Firebase-dependent features will not work.\n" +
    "**********************************************************************************************************************"
  );
} else {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      // app remains null
    }
  } else {
    app = getApps()[0];
  }

  // Initialize Firebase products only on the client side and if app was successfully initialized
  if (app && typeof window !== 'undefined') {
    // Initialize Performance Monitoring
    try {
      performance = getPerformance(app);
      console.log('Firebase Performance Monitoring initialized.');
    } catch (error) {
      console.error('Error initializing Firebase Performance Monitoring:', error);
    }

    // Initialize Analytics
    try {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized.');
    } catch (error) {
      console.error('Error initializing Firebase Analytics:', error);
    }

  }
}

export { app, analytics, performance, firebaseConfig };
