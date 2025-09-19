
import * as admin from "firebase-admin";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// Initialize Firebase Admin SDK only if it hasn't been initialized yet
if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error("Firebase Admin initialization error from service account:", error);
    }
  } else {
    // This path is likely for local development or environments without the service account env var.
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable not set. Attempting to initialize with default credentials.");
    try {
        admin.initializeApp();
    } catch(e) {
        console.error("Fallback Firebase Admin initialization failed:", e);
    }
  }
}

export const adminDb = admin.firestore();
