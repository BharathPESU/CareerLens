/**
 * Unit Tests for Job Manager
 */

import { JobManager } from '@/lib/queue/job-manager';
import { QueueName, JobStatus } from '@/lib/queue/config';

describe('JobManager', () => {
    let jobManager: JobManager;

    beforeAll(() => {
        jobManager = new JobManager();
    });

    afterAll(async () => {
        await jobManager.close();
    });

    describe('createJob', () => {
        it('should create a job successfully', async () => {
            const jobData = {
                type: 'career-insights' as const,
                domain: 'Software Engineering',
                userId: 'test-user-123',
                createdAt: Date.now(),
            };

            const result = await jobManager.createJob(
                QueueName.CAREER_INSIGHTS,
                jobData,
                'test-user-123'
            );

            expect(result.jobId).toBeDefined();
            expect(result.jobId).toContain('test-user-123');
            expect(result.status).toBe(JobStatus.QUEUED);
        });

        it('should throw error for invalid queue', async () => {
            const jobData = {
                type: 'invalid-type' as any,
                userId: 'test-user-123',
                createdAt: Date.now(),
            };

            await expect(
                jobManager.createJob('invalid-queue' as any, jobData, 'test-user-123')
            ).rejects.toThrow();
        });
    });

    describe('getJobStatus', () => {
        it('should get job status for valid job', async () => {
            // Create a job first
            const jobData = {
                type: 'skill-gap-analysis' as const,
                targetRole: 'DevOps Engineer',
                industry: 'Technology',
                currentSkills: ['Docker', 'Kubernetes'],
                userId: 'test-user-123',
                createdAt: Date.now(),
            };

            const { jobId } = await jobManager.createJob(
                QueueName.SKILL_GAP_ANALYSIS,
                jobData,
                'test-user-123'
            );

            // Get status
            const status = await jobManager.getJobStatus(jobId, 'test-user-123');

            expect(status).toBeDefined();
            expect(status?.jobId).toBe(jobId);
            expect(status?.status).toBe(JobStatus.QUEUED);
        });

        it('should throw error for unauthorized access', async () => {
            const jobId = 'test-user-123:type:12345:abc';

            await expect(
                jobManager.getJobStatus(jobId, 'wrong-user')
            ).rejects.toThrow('Unauthorized');
        });

        it('should return null for non-existent job', async () => {
            const status = await jobManager.getJobStatus(
                'test-user-123:type:99999:xyz',
                'test-user-123'
            );

            expect(status).toBeNull();
        });
    });

    describe('cancelJob', () => {
        it('should cancel a queued job', async () => {
            const jobData = {
                type: 'resume-optimization' as const,
                resumeText: 'Sample resume',
                targetRole: 'Frontend Developer',
                userId: 'test-user-123',
                createdAt: Date.now(),
            };

            const { jobId } = await jobManager.createJob(
                QueueName.RESUME_OPTIMIZATION,
                jobData,
                'test-user-123'
            );

            const cancelled = await jobManager.cancelJob(jobId, 'test-user-123');

            expect(cancelled).toBe(true);
        });

        it('should throw error for unauthorized cancellation', async () => {
            const jobId = 'test-user-123:type:12345:abc';

            await expect(
                jobManager.cancelJob(jobId, 'wrong-user')
            ).rejects.toThrow('Unauthorized');
        });
    });

    describe('getUserActiveJobs', () => {
        it('should get all active jobs for user', async () => {
            const userId = 'test-user-456';

            // Create multiple jobs
            await Promise.all([
                jobManager.createJob(
                    QueueName.CAREER_INSIGHTS,
                    {
                        type: 'career-insights',
                        domain: 'AI',
                        userId,
                        createdAt: Date.now(),
                    },
                    userId
                ),
                jobManager.createJob(
                    QueueName.SKILL_GAP_ANALYSIS,
                    {
                        type: 'skill-gap-analysis',
                        targetRole: 'ML Engineer',
                        industry: 'AI',
                        currentSkills: ['Python'],
                        userId,
                        createdAt: Date.now(),
                    },
                    userId
                ),
            ]);

            const activeJobs = await jobManager.getUserActiveJobs(userId);

            expect(activeJobs.length).toBeGreaterThanOrEqual(2);
            activeJobs.forEach((job) => {
                expect(job.jobId).toContain(userId);
            });
        });
    });

    describe('cleanupOldJobs', () => {
        it('should cleanup old completed jobs', async () => {
            const cleaned = await jobManager.cleanupOldJobs(0.001); // Very short age for testing

            expect(cleaned).toBeGreaterThanOrEqual(0);
        });
    });
});

describe('Job Ownership Validation', () => {
    it('should validate correct ownership', () => {
        const { validateJobOwnership } = require('@/lib/queue/config');

        const jobId = 'user-123:career-insights:1234567890:abc';
        const result = validateJobOwnership(jobId, 'user-123');

        expect(result).toBe(true);
    });

    it('should reject incorrect ownership', () => {
        const { validateJobOwnership } = require('@/lib/queue/config');

        const jobId = 'user-123:career-insights:1234567890:abc';
        const result = validateJobOwnership(jobId, 'user-456');

        expect(result).toBe(false);
    });

    it('should extract user ID from job ID', () => {
        const { extractUserIdFromJobId } = require('@/lib/queue/config');

        const jobId = 'user-123:career-insights:1234567890:abc';
        const userId = extractUserIdFromJobId(jobId);

        expect(userId).toBe('user-123');
    });
});
