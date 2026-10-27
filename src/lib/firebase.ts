/**
 * Legacy compatibility layer: maps Firebase references to AWS DynamoDB and Cognito
 * This ensures that any residual imports do not throw errors or require the firebase package.
 */
import { db as dynamoDb } from './dynamodb';
import * as cognitoAuth from './cognito-auth';

export const app = {
  name: '[AWS-MIGRATED-APP]',
  options: {},
};

export const db = dynamoDb;
export const auth = cognitoAuth;

export default { app, db, auth };
