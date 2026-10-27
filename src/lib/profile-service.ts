'use client';

import { getItem, putItem, TABLES } from './dynamodb';
import type { UserProfile } from './types';

/**
 * Serializes a user profile.
 * Safe for Next.js server actions.
 */
export function serializeProfile(profile: any): any {
  if (!profile) return profile;
  
  return {
    ...profile,
    updatedAt: profile.updatedAt || undefined,
    createdAt: profile.createdAt || undefined,
  };
}

/**
 * Fetches a user's profile from DynamoDB.
 * @param _db - Legacy parameter for backward compatibility.
 * @param userId - The ID of the user.
 * @returns The user profile data or undefined if not found.
 */
export async function fetchProfile(_db: any, userId: string): Promise<UserProfile | undefined> {
  if (!userId) {
    console.warn('User ID is not provided. Cannot fetch profile.');
    return undefined;
  }
  try {
    const data = await getItem<UserProfile>(TABLES.USERS, { userId });
    if (data) {
      return data;
    }
    console.log('No profile document found for user:', userId);
    return undefined;
  } catch (err: any) {
    console.error('Error fetching profile from DynamoDB:', err);
    return undefined;
  }
}

/**
 * Creates or updates a user's profile in DynamoDB.
 * @param _db - Legacy parameter for backward compatibility.
 * @param userId - The ID of the user.
 * @param data - The user profile data to save.
 */
export async function saveProfile(
  _db: any,
  userId: string,
  data: UserProfile
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to save the profile.');
  }

  try {
    console.log('Saving profile to DynamoDB for user:', userId);
    const existing = (await getItem(TABLES.USERS, { userId })) || {};
    await putItem(TABLES.USERS, {
      ...existing,
      ...data,
      userId,
      updatedAt: new Date().toISOString(),
    });
    console.log('Profile successfully saved to DynamoDB!');
  } catch (error: any) {
    console.error('Error saving profile to DynamoDB:', error);
    throw new Error(error.message || 'Could not save your profile to the database. Please try again.');
  }
}
