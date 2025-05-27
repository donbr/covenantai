// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, type Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
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

let firebaseAppInstance: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;
let performanceInstance: FirebasePerformance | null = null;

function initializeFirebaseAppInternal(): FirebaseApp | null {
  if (firebaseAppInstance) {
    return firebaseAppInstance;
  }

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.error(
      "**********************************************************************************************************************\n" +
      "IMPORTANT: Firebase API Key is missing or is still set to the placeholder 'YOUR_API_KEY'.\n" +
      "Please update your .env file with your actual Firebase project credentials for 'NEXT_PUBLIC_FIREBASE_API_KEY'.\n" +
      "Firebase will not be initialized, and Firebase-dependent features will not work.\n" +
      "**********************************************************************************************************************"
    );
    return null;
  }

  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    console.error(
      "**********************************************************************************************************************\n" +
      "IMPORTANT: Firebase Project ID is missing or is still set to the placeholder 'YOUR_PROJECT_ID'.\n" +
      "Please update your .env file with your actual Firebase project credentials for 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'.\n" +
      "Firebase will not be initialized correctly.\n" +
      "**********************************************************************************************************************"
    );
    return null;
  }

  if (getApps().length === 0) {
    try {
      firebaseAppInstance = initializeApp(firebaseConfig);
      console.log('Firebase App initialized.');
    } catch (e) {
      console.error("Firebase app initialization failed:", e);
      // firebaseAppInstance remains null
    }
  } else {
    firebaseAppInstance = getApps()[0];
  }
  return firebaseAppInstance;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseAppInstance) {
    firebaseAppInstance = initializeFirebaseAppInternal();
  }
  return firebaseAppInstance;
}

export function getFirebaseAnalytics(): Analytics | null {
  if (analyticsInstance) {
    return analyticsInstance;
  }
  if (typeof window !== 'undefined') {
    const app = getFirebaseApp();
    if (app) {
      isAnalyticsSupported().then((supported) => {
        if (supported) {
          try {
            analyticsInstance = getAnalytics(app);
            console.log('Firebase Analytics initialized.');
          } catch (error) {
            console.error('Error initializing Firebase Analytics:', error);
          }
        } else {
          console.log('Firebase Analytics is not supported in this environment.');
        }
      }).catch(error => {
        console.error('Error checking Firebase Analytics support:', error);
      });
    }
  }
  // This function might return null if called before isAnalyticsSupported resolves or if not supported/errored.
  // Consuming code (like FirebaseProvider) calling it in useEffect is generally fine.
  return analyticsInstance;
}

export function getFirebasePerformance(): FirebasePerformance | null {
  if (performanceInstance) {
    return performanceInstance;
  }
  if (typeof window !== 'undefined') {
    const app = getFirebaseApp();
    if (app) {
      try {
        performanceInstance = getPerformance(app);
        console.log('Firebase Performance Monitoring initialized.');
      } catch (error) {
        console.error('Error initializing Firebase Performance Monitoring:', error);
      }
    }
  }
  return performanceInstance;
}

// Export config only if it's truly needed elsewhere, which is rare.
// Direct use of config should be minimized outside this file.
export { firebaseConfig };
