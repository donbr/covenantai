// src/components/firebase-provider.tsx
"use client";

import React, { useEffect } from 'react';
import { app, performance as initializedPerformance, firebaseConfig } from '@/lib/firebase';

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') { // Ensure this runs only on client
      if (initializedPerformance) {
        console.log('FirebaseProvider mounted, Performance Monitoring is active.');
      } else if (!app && (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY")) {
        // This case is largely handled by the direct console.error in firebase.ts,
        // but we can add a follow-up warning here if needed or for completeness.
        console.warn(
          "FirebaseProvider mounted: Firebase app was not initialized because the API key in .env is likely missing or still the placeholder 'YOUR_API_KEY'. " +
          "Performance Monitoring cannot be active. Please provide a valid NEXT_PUBLIC_FIREBASE_API_KEY in your .env file."
        );
      } else if (!app) {
        console.warn(
          "FirebaseProvider mounted: Firebase app was not initialized. This could be due to an invalid API key (that is not the placeholder) or other Firebase configuration issues in .env. " +
          "Performance Monitoring cannot be active."
        );
      } else if (app && !initializedPerformance) {
        console.warn(
          'FirebaseProvider mounted: Firebase app is initialized, but Performance Monitoring could not be. ' +
          'Check for errors during performance initialization in firebase.ts or the console.'
        );
      }
    }
  }, []);

  return <>{children}</>;
}
