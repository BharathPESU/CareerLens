
'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  loading: true,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [firebase, setFirebase] = useState<Omit<FirebaseContextType, 'loading'>>({ app: null, auth: null, db: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let app: FirebaseApp;
    if (!getApps().length) {
      if (firebaseConfig.projectId) {
        app = initializeApp(firebaseConfig);
      } else {
        console.error("Firebase config is missing Project ID. App cannot be initialized.");
        setLoading(false);
        return;
      }
    } else {
      app = getApp();
    }

    const auth = getAuth(app);
    const db = getFirestore(app);

    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open.');
      } else if (err.code == 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser.');
      }
    });

    setFirebase({ app, auth, db });
    setLoading(false);

  }, []);

  return (
    <FirebaseContext.Provider value={{ ...firebase, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
};
