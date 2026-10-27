import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

const region = process.env.AWS_REGION || 'us-east-1';

// Initialize DynamoDB Client
// In development, if AWS credentials are not set, it won't crash on module load
export const isDynamoConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

const rawClient = new DynamoDBClient({
  region,
  credentials: isDynamoConfigured
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export const db = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Standard Table Names
export const TABLES = {
  USERS: process.env.DYNAMODB_TABLE_USERS || 'CareerLens_Users',
  ACTIVITIES: process.env.DYNAMODB_TABLE_ACTIVITIES || 'CareerLens_Activities',
  CAREER_GRAPHS: process.env.DYNAMODB_TABLE_GRAPHS || 'CareerLens_CareerGraphs',
  COLLEGES: process.env.DYNAMODB_TABLE_COLLEGES || 'CareerLens_Colleges',
  CAREER_UPDATES: process.env.DYNAMODB_TABLE_UPDATES || 'CareerLens_CareerUpdates',
  MARKET_DATA: process.env.DYNAMODB_TABLE_MARKET_DATA || 'CareerLens_MarketData',
  RESOURCES: process.env.DYNAMODB_TABLE_RESOURCES || 'CareerLens_Resources',
  COMMUNITY_REVIEWS: process.env.DYNAMODB_TABLE_REVIEWS || 'CareerLens_Reviews',
};

/**
 * Fetch a single item by primary key
 */
export async function getItem<T = any>(tableName: string, key: Record<string, any>): Promise<T | null> {
  if (!isDynamoConfigured) {
    console.warn(`[DynamoDB] AWS credentials missing. Skipping getItem on ${tableName}`);
    return null;
  }
  try {
    const result = await db.send(new GetCommand({ TableName: tableName, Key: key }));
    return (result.Item as T) || null;
  } catch (error) {
    console.error(`[DynamoDB] Error fetching from ${tableName}:`, error);
    throw error;
  }
}

/**
 * Insert or replace an item
 */
export async function putItem(tableName: string, item: Record<string, any>): Promise<void> {
  if (!isDynamoConfigured) {
    console.warn(`[DynamoDB] AWS credentials missing. Skipping putItem on ${tableName}`);
    return;
  }
  try {
    await db.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          ...item,
          updatedAt: new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    console.error(`[DynamoDB] Error writing to ${tableName}:`, error);
    throw error;
  }
}

/**
 * Query items with a Partition Key condition
 */
export async function queryItems<T = any>(
  tableName: string,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>,
  options?: {
    expressionAttributeNames?: Record<string, string>;
    scanIndexForward?: boolean;
    limit?: number;
    indexName?: string;
  }
): Promise<T[]> {
  if (!isDynamoConfigured) {
    console.warn(`[DynamoDB] AWS credentials missing. Skipping queryItems on ${tableName}`);
    return [];
  }
  try {
    const result = await db.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: options?.expressionAttributeNames,
        ScanIndexForward: options?.scanIndexForward ?? true,
        Limit: options?.limit,
        IndexName: options?.indexName,
      })
    );
    return (result.Items as T[]) || [];
  } catch (error) {
    console.error(`[DynamoDB] Error querying ${tableName}:`, error);
    throw error;
  }
}

/**
 * Scan items in a table (useful for small datasets like colleges or updates)
 */
export async function scanItems<T = any>(
  tableName: string,
  options?: {
    limit?: number;
    filterExpression?: string;
    expressionAttributeValues?: Record<string, any>;
  }
): Promise<T[]> {
  if (!isDynamoConfigured) {
    console.warn(`[DynamoDB] AWS credentials missing. Skipping scanItems on ${tableName}`);
    return [];
  }
  try {
    const result = await db.send(
      new ScanCommand({
        TableName: tableName,
        Limit: options?.limit,
        FilterExpression: options?.filterExpression,
        ExpressionAttributeValues: options?.expressionAttributeValues,
      })
    );
    return (result.Items as T[]) || [];
  } catch (error) {
    console.error(`[DynamoDB] Error scanning ${tableName}:`, error);
    throw error;
  }
}

/**
 * Delete an item by key
 */
export async function deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
  if (!isDynamoConfigured) {
    console.warn(`[DynamoDB] AWS credentials missing. Skipping deleteItem on ${tableName}`);
    return;
  }
  try {
    await db.send(new DeleteCommand({ TableName: tableName, Key: key }));
  } catch (error) {
    console.error(`[DynamoDB] Error deleting from ${tableName}:`, error);
    throw error;
  }
}
