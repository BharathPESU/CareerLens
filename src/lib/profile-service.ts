
'use client';

import type { UserProfile } from './types';
import type { User } from 'firebase/auth';

/**
 * Fetches a user's profile from Firestore via the API route.
 * @param userId - The ID of the user.
 * @returns An object with success status, data, and an optional error message.
 */
export async function fetchProfile(
  userId: string
): Promise<{ success: boolean; data?: UserProfile | null; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User ID is required.' };
  }
  try {
    const res = await fetch(`/api/profile?uid=${userId}`);
    const data = await res.json();

    if (!res.ok) {
      // If profile not found, it's not a critical error, just return null data.
      if (res.status === 404) {
        return { success: true, data: null };
      }
      throw new Error(data.error || 'Failed to fetch profile');
    }
    
    // The API route returns timestamps as strings, so we need to convert them back to Date objects.
    if (data.dob) {
      data.dob = new Date(data.dob);
    }

    return { success: true, data: data as UserProfile };
  } catch (err: any) {
    console.error('Error fetching profile via API:', err);
    return { success: false, error: 'Failed to retrieve profile data from the server.' };
  }
}

/**
 * Creates or updates a user's profile in Firestore via the API route.
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
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userId, profileData: data }),
    });

    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.error || 'Failed to save profile');
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error saving profile via API:', err);
    return { success: false, error: 'Failed to save profile changes to the server.' };
  }
}
