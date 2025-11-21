/**
 * Job Manager Service
 * Handles job creation, status checking, and cancellation
 */

import { Queue, Job } from 'bullmq';
import IORedis from 'ioredis';
import {
    QueueName,
    JobData,
    JobStatus,
    JobStatusResponse,
    JobProgress,
    JobResult,
    createQueue,
    createRedisConnection,
    createJobId,
    validateJobOwnership,
    REDIS_CHANNELS,
} from './config';

export class JobManager {
    private queues: Map<QueueName, Queue>;
    private redis: IORedis;

    constructor() {
        this.queues = new Map();
        this.redis = createRedisConnection();
        this.initializeQueues();
    }

    /**
     * Initialize all queues
     */
    private initializeQueues(): void {
        Object.values(QueueName).forEach((queueName) => {
            const queue = createQueue(queueName);
            this.queues.set(queueName, queue);
        });

        console.log('✅ Job queues initialized:', Array.from(this.queues.keys()));
    }

    /**
     * Create and enqueue a new job
     */
    async createJob(
        queueName: QueueName,
        jobData: JobData,
        userId: string
    ): Promise<{ jobId: string; status: string }> {
        try {
            const queue = this.queues.get(queueName);
            if (!queue) {
                throw new Error(`Queue ${queueName} not found`);
            }

            // Create unique job ID with user prefix
            const jobId = createJobId(userId, jobData.type);

            // Add job to queue
            const job = await queue.add(jobData.type, jobData, {
                jobId,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            });

            console.log(`📝 Job created: ${jobId} in queue ${queueName}`);

            // Publish job created event
            await this.redis.publish(
                REDIS_CHANNELS.JOBS,
                JSON.stringify({
                    event: 'job:created',
                    jobId,
                    userId,
                    queueName,
                    type: jobData.type,
                    timestamp: Date.now(),
                })
            );

            return {
                jobId: job.id!,
                status: JobStatus.QUEUED,
            };
        } catch (error) {
            console.error('❌ Error creating job:', error);
            throw error;
        }
    }

    /**
     * Get job status and result
     */
    async getJobStatus(
        jobId: string,
        userId: string
    ): Promise<JobStatusResponse | null> {
        try {
            // Validate ownership
            if (!validateJobOwnership(jobId, userId)) {
                throw new Error('Unauthorized: Job does not belong to user');
            }

            // Find job across all queues
            let job: Job | undefined;
            let queueName: QueueName | undefined;

            for (const [name, queue] of this.queues) {
                const foundJob = await queue.getJob(jobId);
                if (foundJob) {
                    job = foundJob;
                    queueName = name;
                    break;
                }
            }

            if (!job) {
                return null;
            }

            // Determine status
            const state = await job.getState();
            let status: JobStatus;

            switch (state) {
                case 'waiting':
                case 'delayed':
                    status = JobStatus.QUEUED;
                    break;
                case 'active':
                    status = JobStatus.PROCESSING;
                    break;
                case 'completed':
                    status = JobStatus.COMPLETED;
                    break;
                case 'failed':
                    status = JobStatus.FAILED;
                    break;
                default:
                    status = JobStatus.QUEUED;
            }

            // Build response
            const response: JobStatusResponse = {
                jobId: job.id!,
                status,
                createdAt: job.timestamp,
                startedAt: job.processedOn || undefined,
                completedAt: job.finishedOn || undefined,
            };

            // Add progress if processing
            if (status === JobStatus.PROCESSING && job.progress) {
                response.progress = job.progress as JobProgress;
            }

            // Add result if completed
            if (status === JobStatus.COMPLETED && job.returnvalue) {
                response.result = job.returnvalue as JobResult;
            }

            // Add failure reason if failed
            if (status === JobStatus.FAILED && job.failedReason) {
                response.failedReason = job.failedReason;
            }

            return response;
        } catch (error) {
            console.error('❌ Error getting job status:', error);
            throw error;
        }
    }

    /**
     * Cancel a job
     */
    async cancelJob(jobId: string, userId: string): Promise<boolean> {
        try {
            // Validate ownership
            if (!validateJobOwnership(jobId, userId)) {
                throw new Error('Unauthorized: Job does not belong to user');
            }

            // Find and cancel job
            for (const queue of this.queues.values()) {
                const job = await queue.getJob(jobId);
                if (job) {
                    const state = await job.getState();

                    // Only cancel if not already completed or failed
                    if (state !== 'completed' && state !== 'failed') {
                        await job.remove();

                        // Publish cancellation event
                        await this.redis.publish(
                            REDIS_CHANNELS.JOBS,
                            JSON.stringify({
                                event: 'job:cancelled',
                                jobId,
                                userId,
                                timestamp: Date.now(),
                            })
                        );

                        console.log(`🚫 Job cancelled: ${jobId}`);
                        return true;
                    }

                    return false;
                }
            }

            return false;
        } catch (error) {
            console.error('❌ Error cancelling job:', error);
            throw error;
        }
    }

    /**
     * Get all active jobs for a user
     */
    async getUserActiveJobs(userId: string): Promise<JobStatusResponse[]> {
        try {
            const activeJobs: JobStatusResponse[] = [];

            for (const queue of this.queues.values()) {
                // Get waiting, active, and delayed jobs
                const [waiting, active, delayed] = await Promise.all([
                    queue.getWaiting(),
                    queue.getActive(),
                    queue.getDelayed(),
                ]);

                const allJobs = [...waiting, ...active, ...delayed];

                // Filter by user and build responses
                for (const job of allJobs) {
                    if (validateJobOwnership(job.id!, userId)) {
                        const status = await this.getJobStatus(job.id!, userId);
                        if (status) {
                            activeJobs.push(status);
                        }
                    }
                }
            }

            return activeJobs;
        } catch (error) {
            console.error('❌ Error getting user active jobs:', error);
            throw error;
        }
    }

    /**
     * Cleanup completed jobs older than specified age
     */
    async cleanupOldJobs(maxAgeHours: number = 24): Promise<number> {
        try {
            const maxAge = Date.now() - maxAgeHours * 60 * 60 * 1000;
            let cleaned = 0;

            for (const queue of this.queues.values()) {
                const completed = await queue.getCompleted();

                for (const job of completed) {
                    if (job.timestamp < maxAge) {
                        await job.remove();
                        cleaned++;
                    }
                }
            }

            console.log(`🧹 Cleaned up ${cleaned} old jobs`);
            return cleaned;
        } catch (error) {
            console.error('❌ Error cleaning up jobs:', error);
            throw error;
        }
    }

    /**
     * Close connections
     */
    async close(): Promise<void> {
        for (const queue of this.queues.values()) {
            await queue.close();
        }
        await this.redis.quit();
        console.log('👋 Job manager closed');
    }
}

// Singleton instance
let jobManagerInstance: JobManager | null = null;

export function getJobManager(): JobManager {
    if (!jobManagerInstance) {
        jobManagerInstance = new JobManager();
    }
    return jobManagerInstance;
}
