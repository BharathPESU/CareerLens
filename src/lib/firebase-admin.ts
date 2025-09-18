import * as admin from 'firebase-admin';

let app: admin.app.App;

const initializeAdminApp = () => {
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return;
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Firebase Admin SDK will not be initialized.'
    );
    return;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
};

initializeAdminApp();

const adminDb = app ? admin.firestore() : null;

export { adminDb };
