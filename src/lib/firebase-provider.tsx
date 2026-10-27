'use client';

import React, { createContext, useEffect, useState, useContext } from 'react';
import {
  cognitoSignIn,
  cognitoSignUp,
  cognitoSignOut,
  getStoredUser,
  type AuthUser,
  isCognitoConfigured,
} from './cognito-auth';
import { db as dynamoDb, isDynamoConfigured } from './dynamodb';

interface AWSContextValue {
  app: any | null;
  auth: any | null;
  db: any | null;
  loading: boolean;
}

const AWSContext = createContext<AWSContextValue>({
  app: null,
  auth: null,
  db: dynamoDb,
  loading: false,
});

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  googleSignIn: () => Promise<any>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  googleSignIn: async () => {},
  logOut: async () => {},
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    try {
      console.log('Initializing AWS Cognito Session...');
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
    } catch (err) {
      console.warn('Error reading stored session:', err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signUp = async (email: string, pass: string) => {
    const newUser = await cognitoSignUp(email, pass);
    setUser(newUser);
    return newUser;
  };

  const signIn = async (email: string, pass: string) => {
    const loggedInUser = await cognitoSignIn(email, pass);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const googleSignIn = async () => {
    console.log('Initiating Google Federated Sign-in via Cognito...');
    // If Hosted UI domain is configured, redirect to Google authorization endpoint
    const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/` : '';

    if (domain && clientId) {
      window.location.href = `https://${domain}/oauth2/authorize?identity_provider=Google&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&client_id=${clientId}&scope=email+openid+profile`;
      return;
    }

    // Local / Dev Fallback
    const mockUser: AuthUser = {
      uid: `google_user_${Date.now()}`,
      email: 'student@careerlens.edu',
      displayName: 'CareerLens Scholar',
      photoURL: null,
      emailVerified: true,
    };
    setUser(mockUser);
    return mockUser;
  };

  const logOut = async () => {
    await cognitoSignOut();
    setUser(null);
  };

  const awsValue = {
    app: { name: 'CareerLens AWS' },
    auth: { currentUser: user },
    db: dynamoDb,
    loading: false,
  };

  const authValue = {
    user,
    loading: authLoading,
    signUp,
    signIn,
    googleSignIn,
    logOut,
  };

  return (
    <AWSContext.Provider value={awsValue}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </AWSContext.Provider>
  );
}

// Custom hook to use AWS services context (aliased as useFirebase for backwards compatibility)
export const useFirebase = () => {
  const context = useContext(AWSContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within an AWS/Firebase Provider');
  }
  return context;
};

// Custom hook specifically for authentication
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AWS/Firebase Provider');
  }
  return context;
};
