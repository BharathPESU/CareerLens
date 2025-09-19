
'use client';

import { db } from "./firebaseClient";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { UserProfile } from './types';

/**
 * Creates or updates a user's profile in Firestore using the client-side SDK.
 * Uses setDoc with { merge: true } to seamlessly handle both cases.
 * @param userId - The ID of the user.
 * @param data - The user profile data to save.
 * @returns An object with success status and an optional error message.
 */
export async function saveProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required to save the profile.' };
  }
  try {
    const docRef = doc(db, "users", userId);
    
    // Add server timestamp for updates
    const dataToSave = {
      ...data,
      updatedAt: Timestamp.now()
    };

    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true };
  } catch (err: any) {
    console.error('Error saving profile to Firestore:', err);
    return { success: false, error: err.message || 'Failed to save profile changes. Please check your connection.' };
  }
}
