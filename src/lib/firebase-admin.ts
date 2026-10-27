/**
 * Legacy compatibility layer: maps Firebase Admin references to AWS DynamoDB
 * This ensures that any residual imports do not throw errors or require firebase-admin.
 */
import { db as dynamoDb, TABLES, getItem, putItem, scanItems } from './dynamodb';

export const adminDb = {
  collection: (name: string) => ({
    doc: (id: string) => ({
      get: async () => {
        const data = await getItem(name, { id });
        return {
          exists: Boolean(data),
          data: () => data,
          id,
        };
      },
      set: async (data: any, options?: any) => {
        return putItem(name, { id, ...data });
      },
    }),
  }),
};

export const admin = {
  apps: [{ name: '[AWS-MIGRATED-ADMIN]' }],
  initializeApp: () => {},
  firestore: () => adminDb,
};

export default admin;
