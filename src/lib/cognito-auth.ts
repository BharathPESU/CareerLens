'use client';

/**
 * Amazon Cognito Authentication Service
 * Replaces Firebase Auth for user management and session verification
 */

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '';
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';

export const isCognitoConfigured = Boolean(clientId);

const cognitoClient = new CognitoIdentityProviderClient({
  region,
});

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export type User = AuthUser;

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'careerlens_auth_access_token',
  ID_TOKEN: 'careerlens_auth_id_token',
  REFRESH_TOKEN: 'careerlens_auth_refresh_token',
  USER: 'careerlens_auth_user',
};

/**
 * Helper to store session in localStorage
 */
function storeSession(tokens: { accessToken?: string; idToken?: string; refreshToken?: string }, user: AuthUser) {
  if (typeof window === 'undefined') return;
  if (tokens.accessToken) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  if (tokens.idToken) localStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.idToken);
  if (tokens.refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

/**
 * Helper to clear session from localStorage
 */
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ID_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

/**
 * Get stored user session
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Get stored Access Token
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Sign up a new user with Cognito
 */
export async function cognitoSignUp(email: string, password: string): Promise<AuthUser> {
  if (!isCognitoConfigured) {
    console.warn('[Cognito] Client ID not configured. Using mock demo signup.');
    const mockUser: AuthUser = {
      uid: `user_${Date.now()}`,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: true,
    };
    storeSession({ accessToken: 'mock_token' }, mockUser);
    return mockUser;
  }

  try {
    const command = new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
      ],
    });

    const response = await cognitoClient.send(command);
    const uid = response.UserSub || `user_${Date.now()}`;
    const user: AuthUser = {
      uid,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: response.UserConfirmed ?? false,
    };

    storeSession({}, user);
    return user;
  } catch (error: any) {
    console.error('[Cognito] Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up with Amazon Cognito');
  }
}

/**
 * Sign in an existing user with Cognito
 */
export async function cognitoSignIn(email: string, password: string): Promise<AuthUser> {
  if (!isCognitoConfigured) {
    console.warn('[Cognito] Client ID not configured. Using mock demo signin.');
    const mockUser: AuthUser = {
      uid: `demo_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      displayName: email.split('@')[0],
      photoURL: null,
      emailVerified: true,
    };
    storeSession({ accessToken: 'mock_token' }, mockUser);
    return mockUser;
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);
    const authResult = response.AuthenticationResult;

    if (!authResult || !authResult.AccessToken) {
      throw new Error('Authentication challenge required or authentication failed.');
    }

    // Retrieve user attributes using the access token
    const getUserCmd = new GetUserCommand({
      AccessToken: authResult.AccessToken,
    });
    const userDetails = await cognitoClient.send(getUserCmd);

    const emailAttr = userDetails.UserAttributes?.find(a => a.Name === 'email')?.Value || email;
    const subAttr = userDetails.UserAttributes?.find(a => a.Name === 'sub')?.Value || `user_${Date.now()}`;

    const user: AuthUser = {
      uid: subAttr,
      email: emailAttr,
      displayName: emailAttr.split('@')[0],
      photoURL: null,
      emailVerified: true,
    };

    storeSession(
      {
        accessToken: authResult.AccessToken,
        idToken: authResult.IdToken,
        refreshToken: authResult.RefreshToken,
      },
      user
    );

    return user;
  } catch (error: any) {
    console.error('[Cognito] Sign in error:', error);
    throw new Error(error.message || 'Invalid email or password');
  }
}

/**
 * Confirm user signup via verification code
 */
export async function cognitoConfirmSignUp(email: string, code: string): Promise<boolean> {
  if (!isCognitoConfigured) return true;

  try {
    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    });
    await cognitoClient.send(command);
    return true;
  } catch (error: any) {
    console.error('[Cognito] Confirmation error:', error);
    throw new Error(error.message || 'Invalid confirmation code');
  }
}

/**
 * Sign out user
 */
export async function cognitoSignOut(): Promise<void> {
  clearSession();
}
