import { isDynamoConfigured, TABLES } from '../dynamodb';

/**
 * Market Data Configuration for CareerLens Resume Builder
 * 
 * Migrated from BigQuery to AWS DynamoDB (AWS Free Tier compliant).
 * Provides access to job market data, resume keywords, and career insights.
 */

// Dataset and table names mapping to DynamoDB
export const BQ_CONFIG = {
    dataset: 'career_lens_data',
    tables: {
        jobMarketData: TABLES.MARKET_DATA,
        resumeKeywords: 'resume_keywords',
        careerInsights: 'career_insights',
    },
};

/**
 * Get table name
 */
export function getTableId(tableName: string): string {
    return tableName;
}

/**
 * Check if data store is properly configured
 */
export function isBigQueryConfigured(): boolean {
    return isDynamoConfigured;
}

export const bigQueryClient = null;
