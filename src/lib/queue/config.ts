/**
 * Background Job Queue Configuration
 * Uses BullMQ + Redis for reliable job processing
 */

import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import IORedis from 'ioredis';

// ================================
// Redis Configuration
// ================================

export const REDIS_CONFIG: ConnectionOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
};

// ================================
// Queue Names
// ================================

export enum QueueName {
    RESUME_GENERATION = 'resume-generation',
    RESUME_OPTIMIZATION = 'resume-optimization',
    SKILL_GAP_ANALYSIS = 'skill-gap-analysis',
    CAREER_INSIGHTS = 'career-insights',
    INTERVIEW_PREP = 'interview-prep',
}

// ================================
// Job Types & Data Interfaces
// ================================

export interface BaseJobData {
    userId: string;
    userEmail?: string;
    createdAt: number;
}

export interface ResumeGenerationJobData extends BaseJobData {
    type: 'resume-generation';
    resumeData: {
        personalInfo: any;
        experience: any[];
        education: any[];
        skills: string[];
    };
    targetRole?: string;
    industry?: string;
}

export interface ResumeOptimizationJobData extends BaseJobData {
    type: 'resume-optimization';
    resumeText: string;
    targetRole: string;
    industry?: string;
}

export interface SkillGapAnalysisJobData extends BaseJobData {
    type: 'skill-gap-analysis';
    targetRole: string;
    industry: string;
    currentSkills: string[];
}

export interface CareerInsightsJobData extends BaseJobData {
    type: 'career-insights';
    domain: string;
    currentRole?: string;
    experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Lead';
    location?: string;
}

export type JobData =
    | ResumeGenerationJobData
    | ResumeOptimizationJobData
    | SkillGapAnalysisJobData
    | CareerInsightsJobData;

// ================================
// Job Status & Progress
// ================================

export enum JobStatus {
    QUEUED = 'queued',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export interface JobProgress {
    percent: number; // 0-100
    message: string;
    step?: string;
    data?: any;
}

export interface JobResult {
    success: boolean;
    data?: any;
    error?: string;
    processingTime?: number;
    completedAt?: number;
}

export interface JobStatusResponse {
    jobId: string;
    status: JobStatus;
    progress?: JobProgress;
    result?: JobResult;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    failedReason?: string;
}

// ================================
// Job Options
// ================================

export const DEFAULT_JOB_OPTIONS = {
    attempts: 3,
    backoff: {
        type: 'exponential' as const,
        delay: 2000,
    },
    removeOnComplete: {
        age: 24 * 3600, // Keep completed jobs for 24 hours
        count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
        age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
};

// ================================
// Redis Pub/Sub Channels
// ================================

export const REDIS_CHANNELS = {
    JOBS: 'jobs-channel',
    JOB_PROGRESS: (jobId: string) => `job:${jobId}:progress`,
    JOB_COMPLETED: (jobId: string) => `job:${jobId}:completed`,
    JOB_FAILED: (jobId: string) => `job:${jobId}:failed`,
};

// ================================
// Helper Functions
// ================================

/**
 * Create Redis connection for BullMQ
 */
export function createRedisConnection(): IORedis {
    return new IORedis(REDIS_CONFIG);
}

/**
 * Create a BullMQ queue
 */
export function createQueue(queueName: QueueName): Queue {
    return new Queue(queueName, {
        connection: REDIS_CONFIG,
        defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
}

/**
 * Get job ID with user prefix for security
 */
export function createJobId(userId: string, type: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${userId}:${type}:${timestamp}:${random}`;
}

/**
 * Validate job ownership
 */
export function validateJobOwnership(jobId: string, userId: string): boolean {
    return jobId.startsWith(`${userId}:`);
}

/**
 * Extract user ID from job ID
 */
export function extractUserIdFromJobId(jobId: string): string | null {
    const parts = jobId.split(':');
    return parts.length > 0 ? parts[0] : null;
}
