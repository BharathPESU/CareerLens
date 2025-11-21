/**
 * Background Job Worker
 * Processes jobs from BullMQ queues with progress tracking and error handling
 * 
 * Run with: node worker.js or ts-node worker.ts
 */

import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import {
    QueueName,
    JobData,
    JobProgress,
    JobResult,
    REDIS_CONFIG,
    REDIS_CHANNELS,
    createRedisConnection,
    ResumeOptimizationJobData,
    SkillGapAnalysisJobData,
    CareerInsightsJobData,
} from '../queue/config';

// Import your AI flows
import { optimizeResumeWithAI } from '@/ai/flows/optimize-resume-ai';
import { analyzeSkillGapWithAI } from '@/ai/flows/analyze-skill-gap-ai';
import { analyzeCareerInsightsWithAI } from '@/ai/flows/analyze-career-insights-ai';

// ================================
// Worker Class
// ================================

class JobWorker {
    private workers: Worker[] = [];
    private redis: IORedis;
    private pubRedis: IORedis;

    constructor() {
        this.redis = createRedisConnection();
        this.pubRedis = createRedisConnection(); // Separate connection for pub/sub
        this.initializeWorkers();
    }

    /**
     * Initialize workers for all queues
     */
    private initializeWorkers(): void {
        // Resume Optimization Worker
        this.createWorker(
            QueueName.RESUME_OPTIMIZATION,
            this.processResumeOptimization.bind(this)
        );

        // Skill Gap Analysis Worker
        this.createWorker(
            QueueName.SKILL_GAP_ANALYSIS,
            this.processSkillGapAnalysis.bind(this)
        );

        // Career Insights Worker
        this.createWorker(
            QueueName.CAREER_INSIGHTS,
            this.processCareerInsights.bind(this)
        );

        console.log('✅ Workers initialized for all queues');
    }

    /**
     * Create a worker for a specific queue
     */
    private createWorker(
        queueName: QueueName,
        processor: (job: Job) => Promise<JobResult>
    ): void {
        const worker = new Worker(
            queueName,
            async (job: Job) => {
                console.log(`🔄 Processing job ${job.id} from ${queueName}`);

                try {
                    // Update progress: started
                    await this.updateProgress(job, {
                        percent: 0,
                        message: 'Job started',
                        step: 'initializing',
                    });

                    // Process the job
                    const result = await processor(job);

                    // Publish completion event
                    await this.publishEvent('job:completed', job.id!, result);

                    console.log(`✅ Job ${job.id} completed successfully`);
                    return result;
                } catch (error) {
                    console.error(`❌ Job ${job.id} failed:`, error);

                    // Publish failure event
                    await this.publishEvent('job:failed', job.id!, {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });

                    throw error;
                }
            },
            {
                connection: REDIS_CONFIG,
                concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
                limiter: {
                    max: parseInt(process.env.WORKER_MAX_JOBS || '10'),
                    duration: 60000, // per minute
                },
            }
        );

        // Event handlers
        worker.on('completed', (job) => {
            console.log(`✅ ${queueName} job ${job.id} completed`);
        });

        worker.on('failed', (job, err) => {
            console.error(`❌ ${queueName} job ${job?.id} failed:`, err.message);
        });

        worker.on('error', (err) => {
            console.error(`❌ ${queueName} worker error:`, err);
        });

        this.workers.push(worker);
    }

    /**
     * Update job progress
     */
    private async updateProgress(job: Job, progress: JobProgress): Promise<void> {
        try {
            // Update job progress in BullMQ
            await job.updateProgress(progress);

            // Update progress in Redis for persistence
            await this.redis.setex(
                `job:${job.id}:progress`,
                3600, // 1 hour TTL
                JSON.stringify(progress)
            );

            // Publish progress event via Redis pub/sub
            await this.pubRedis.publish(
                REDIS_CHANNELS.JOB_PROGRESS(job.id!),
                JSON.stringify({
                    event: 'progress',
                    jobId: job.id,
                    progress,
                    timestamp: Date.now(),
                })
            );

            console.log(`📊 Progress update for ${job.id}: ${progress.percent}%`);
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }

    /**
     * Publish events via Redis pub/sub
     */
    private async publishEvent(
        event: string,
        jobId: string,
        data: any
    ): Promise<void> {
        try {
            await this.pubRedis.publish(
                REDIS_CHANNELS.JOBS,
                JSON.stringify({
                    event,
                    jobId,
                    data,
                    timestamp: Date.now(),
                })
            );
        } catch (error) {
            console.error('Error publishing event:', error);
        }
    }

    // ================================
    // Job Processors
    // ================================

    /**
     * Process Resume Optimization Job
     */
    private async processResumeOptimization(job: Job): Promise<JobResult> {
        const startTime = Date.now();
        const data = job.data as ResumeOptimizationJobData;

        try {
            // Step 1: Initialize
            await this.updateProgress(job, {
                percent: 10,
                message: 'Preparing resume analysis...',
                step: 'initialization',
            });

            // Step 2: Analyze with AI
            await this.updateProgress(job, {
                percent: 30,
                message: 'Analyzing resume with Gemini AI...',
                step: 'ai-analysis',
            });

            const result = await optimizeResumeWithAI({
                resumeText: data.resumeText,
                targetRole: data.targetRole,
                industry: data.industry,
            });

            // Step 3: Finalizing
            await this.updateProgress(job, {
                percent: 90,
                message: 'Finalizing results...',
                step: 'finalizing',
            });

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                data: result,
                processingTime,
                completedAt: Date.now(),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                processingTime: Date.now() - startTime,
                completedAt: Date.now(),
            };
        }
    }

    /**
     * Process Skill Gap Analysis Job
     */
    private async processSkillGapAnalysis(job: Job): Promise<JobResult> {
        const startTime = Date.now();
        const data = job.data as SkillGapAnalysisJobData;

        try {
            // Step 1: Fetch market data
            await this.updateProgress(job, {
                percent: 20,
                message: 'Fetching market data...',
                step: 'data-fetching',
            });

            // Step 2: AI analysis
            await this.updateProgress(job, {
                percent: 50,
                message: 'Analyzing skill gaps with AI...',
                step: 'ai-analysis',
            });

            const result = await analyzeSkillGapWithAI({
                targetRole: data.targetRole,
                industry: data.industry,
                currentSkills: data.currentSkills,
            });

            // Step 3: Finalizing
            await this.updateProgress(job, {
                percent: 95,
                message: 'Generating recommendations...',
                step: 'finalizing',
            });

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                data: result,
                processingTime,
                completedAt: Date.now(),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                processingTime: Date.now() - startTime,
                completedAt: Date.now(),
            };
        }
    }

    /**
     * Process Career Insights Job
     */
    private async processCareerInsights(job: Job): Promise<JobResult> {
        const startTime = Date.now();
        const data = job.data as CareerInsightsJobData;

        try {
            // Step 1: Market data
            await this.updateProgress(job, {
                percent: 15,
                message: 'Fetching real-time market data...',
                step: 'data-fetching',
            });

            // Step 2: AI analysis
            await this.updateProgress(job, {
                percent: 40,
                message: 'Generating career insights with AI...',
                step: 'ai-analysis',
            });

            const result = await analyzeCareerInsightsWithAI({
                domain: data.domain,
                currentRole: data.currentRole,
                experienceLevel: data.experienceLevel,
                location: data.location,
            });

            // Step 3: Finalizing
            await this.updateProgress(job, {
                percent: 95,
                message: 'Preparing insights...',
                step: 'finalizing',
            });

            const processingTime = Date.now() - startTime;

            return {
                success: true,
                data: result,
                processingTime,
                completedAt: Date.now(),
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                processingTime: Date.now() - startTime,
                completedAt: Date.now(),
            };
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        console.log('🛑 Shutting down workers...');

        await Promise.all([
            ...this.workers.map((worker) => worker.close()),
            this.redis.quit(),
            this.pubRedis.quit(),
        ]);

        console.log('👋 Workers shut down successfully');
    }
}

// ================================
// Start Worker
// ================================

if (require.main === module) {
    const worker = new JobWorker();

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
        console.log(`\n${signal} received, shutting down gracefully...`);
        await worker.shutdown();
        process.exit(0);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    console.log('🚀 Job worker started successfully');
    console.log(`📊 Concurrency: ${process.env.WORKER_CONCURRENCY || '5'}`);
    console.log(`⏱️  Rate limit: ${process.env.WORKER_MAX_JOBS || '10'} jobs/minute`);
}

export { JobWorker };
