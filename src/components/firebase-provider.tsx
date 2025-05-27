// src/components/firebase-provider.tsx
"use client";

import React, { useEffect } from 'react';
import { getFirebaseApp, getFirebasePerformance, getFirebaseAnalytics, firebaseConfig } from '@/lib/firebase';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only on client
      // Attempt to initialize Firebase services by calling their getters.
      // The actual initialization logic and detailed logging are now within firebase.ts.
      const app = getFirebaseApp();
      
      if (app) {
        console.log('FirebaseProvider: App instance available/initialized.');
        // Initialize Performance Monitoring
        const performance = getFirebasePerformance();
        if (performance) {
          console.log('FirebaseProvider: Performance Monitoring instance available/initialized.');
        } else {
          // Warning for performance might be logged from firebase.ts if there was an issue
        }

        // Initialize Analytics
        const analytics = getFirebaseAnalytics();
        if (analytics) {
          // Analytics init is async due to isSupported(), so instance might be null here immediately
          // but will be set. Log from firebase.ts confirms actual initialization.
          console.log('FirebaseProvider: Analytics initialization process started.');
        } else {
           // Warning for analytics might be logged from firebase.ts
        }
      } else {
        // Errors regarding API key or Project ID missing would have been logged by firebase.ts
        console.warn('FirebaseProvider: Firebase app could not be initialized. Check console for details from firebase.ts.');
      }
    }
  }, []);

  return <>{children}</>;
}
