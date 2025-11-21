import { BigQuery } from '@google-cloud/bigquery';

/**
 * BigQuery Configuration for CareerLens Resume Builder
 * 
 * This module provides the BigQuery client instance for querying
 * job market data, resume keywords, and career insights.
 */

// Initialize BigQuery client
// In production, use service account credentials
// For local development, use Application Default Credentials (ADC)
export const bigQueryClient = new BigQuery({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // If using service account key file:
    // keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// Dataset and table names
export const BQ_CONFIG = {
    dataset: process.env.BIGQUERY_DATASET || 'career_lens_data',
    tables: {
        jobMarketData: 'job_market_data',
        resumeKeywords: 'resume_keywords',
        careerInsights: 'career_insights',
    },
};

/**
 * Get fully qualified table name
 */
export function getTableId(tableName: string): string {
    const projectId = bigQueryClient.projectId;
    return `${projectId}.${BQ_CONFIG.dataset}.${tableName}`;
}

/**
 * Check if BigQuery is properly configured
 */
export function isBigQueryConfigured(): boolean {
    return Boolean(
        process.env.GOOGLE_CLOUD_PROJECT_ID ||
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
}
