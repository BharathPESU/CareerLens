
'use client';

import { useContext } from 'react';
import { FirebaseContext } from './firebase-provider';

/**
 * @deprecated The `useFirebase` hook is available directly from `firebase-provider.tsx`.
 * This file is kept for compatibility but should be removed in the future.
 */
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
