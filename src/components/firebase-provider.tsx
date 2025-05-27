// src/components/firebase-provider.tsx
"use client";

import React, { useEffect } from 'react';
import { app, performance as initializedPerformance } from '@/lib/firebase'; // Imports initialized app and attempts to import initialized performance
// Firebase Performance is initialized in firebase.ts, we just need to ensure this provider is rendered.

interface FirebaseProviderProps {
  children: React.ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  useEffect(() => {
    // The firebase.ts file already initializes performance monitoring on the client side.
    // This effect hook is here to ensure this client component is rendered,
    // which in turn ensures firebase.ts is executed on the client.
    // Log to confirm provider is active.
    if (initializedPerformance) {
      console.log('FirebaseProvider mounted, Performance Monitoring should be active.');
    } else if (typeof window !== 'undefined') {
      console.warn('FirebaseProvider mounted, but Performance Monitoring was not initialized. This might happen if firebase.ts had an issue or during SSR if not properly guarded.');
    }
  }, []);

  return <>{children}</>;
}
