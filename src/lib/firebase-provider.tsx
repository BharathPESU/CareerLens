
'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, type Auth, type User } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firestore';
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAZRQLIieXFytt1ztD8uE6TeaqeT4ggBAs",
  authDomain: "careerlens-1.firebaseapp.com",
  projectId: "careerlens-1",
  storageBucket: "careerlens-1.appspot.com",
  messagingSenderId: "202306950137",
  appId: "1:202306950137:web:ed4e91e619dd4cc7dde328",
  measurementId: "G-WEF48JHJF9"
};

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean; // Unified loading state
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  googleSignIn: () => Promise<any>;
  logOut: () => Promise<any>;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  googleSignIn: async () => {},
  logOut: async () => {},
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [db, setDb] = useState<Firestore | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let _app: FirebaseApp;
    if (!getApps().length) {
        _app = initializeApp(firebaseConfig);
    } else {
      _app = getApp();
    }

    const _auth = getAuth(_app);
    const _db = getFirestore(_app);

    // It's safe to call this multiple times.
    enableIndexedDbPersistence(_db).catch((err) => {
      if (err.code == 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open.');
      } else if (err.code == 'unimplemented') {
        console.warn('Firestore persistence is not available in this browser.');
      }
    });

    isSupported().then(supported => {
        if(supported) {
            getAnalytics(_app);
        }
    })

    setApp(_app);
    setAuth(_auth);
    setDb(_db);

    const unsubscribe = onAuthStateChanged(_auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not available");
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signIn = (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service not available");
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const googleSignIn = async () => {
    if (!auth) throw new Error("Auth service not available");
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  const logOut = () => {
    if (!auth) throw new Error("Auth service not available");
    return signOut(auth);
  };

  const value = {
    app,
    auth,
    db,
    user,
    loading,
    signUp,
    signIn,
    googleSignIn,
    logOut
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// Custom hook to use the Firebase context
export const useFirebaseContext = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebaseContext must be used within a FirebaseProvider');
    }
    return context;
};

// Custom hook specifically for authentication
export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a FirebaseProvider');
    }
    const { user, loading, signUp, signIn, googleSignIn, logOut } = context;
    return { user, loading, signUp, signIn, googleSignIn, logOut };
};

// Custom hook to get Firebase services
export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
}
