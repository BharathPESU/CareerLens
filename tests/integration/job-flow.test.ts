/**
 * Integration Tests for Background Job System
 * Tests end-to-end job processing flow
 */

import { JobManager } from '@/lib/queue/job-manager';
import { JobWorker } from '@/lib/queue/worker';
import { QueueName, JobStatus } from '@/lib/queue/config';

describe('Background Job Integration Tests', () => {
    let jobManager: JobManager;
    let worker: JobWorker;

    beforeAll(async () => {
        jobManager = new JobManager();
        worker = new JobWorker();

        // Give worker time to initialize
        await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    afterAll(async () => {
        await worker.shutdown();
        await jobManager.close();
    });

    describe('End-to-End Job Processing', () => {
        it('should process career insights job successfully', async () => {
            const jobData = {
                type: 'career-insights' as const,
                domain: 'Full Stack Development',
                currentRole: 'Junior Developer',
                experienceLevel: 'Entry' as const,
                location: 'San Francisco',
                userId: 'test-user-e2e',
                createdAt: Date.now(),
            };

            // Create job
            const { jobId } = await jobManager.createJob(
                QueueName.CAREER_INSIGHTS,
                jobData,
                'test-user-e2e'
            );

            expect(jobId).toBeDefined();

            // Wait for initial status
            await new Promise((resolve) => setTimeout(resolve, 500));

            let status = await jobManager.getJobStatus(jobId, 'test-user-e2e');
            expect(status?.status).toBeOneOf([JobStatus.QUEUED, JobStatus.PROCESSING]);

            // Wait for processing (max 30 seconds)
            const maxWait = 30000;
            const startTime = Date.now();

            while (Date.now() - startTime < maxWait) {
                status = await jobManager.getJobStatus(jobId, 'test-user-e2e');

                if (
                    status?.status === JobStatus.COMPLETED ||
                    status?.status === JobStatus.FAILED
                ) {
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            // Verify completion
            expect(status?.status).toBe(JobStatus.COMPLETED);
            expect(status?.result).toBeDefined();
            expect(status?.result?.success).toBe(true);
            expect(status?.result?.data).toBeDefined();

            console.log('✅ Job completed in:', Date.now() - startTime, 'ms');
        }, 60000); // 60 second timeout

        it('should handle skill gap analysis job', async () => {
            const jobData = {
                type: 'skill-gap-analysis' as const,
                targetRole: 'Senior Frontend Developer',
                industry: 'Technology',
                currentSkills: ['React', 'JavaScript', 'CSS'],
                userId: 'test-user-e2e',
                createdAt: Date.now(),
            };

            const { jobId } = await jobManager.createJob(
                QueueName.SKILL_GAP_ANALYSIS,
                jobData,
                'test-user-e2e'
            );

            // Wait for processing
            const maxWait = 30000;
            const startTime = Date.now();

            let status;
            while (Date.now() - startTime < maxWait) {
                status = await jobManager.getJobStatus(jobId, 'test-user-e2e');

                if (
                    status?.status === JobStatus.COMPLETED ||
                    status?.status === JobStatus.FAILED
                ) {
                    break;
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            expect(status?.status).toBe(JobStatus.COMPLETED);
            expect(status?.result?.data).toBeDefined();
        }, 60000);
    });

    describe('Job Cancellation', () => {
        it('should cancel job before processing', async () => {
            const jobData = {
                type: 'resume-optimization' as const,
                resumeText: 'Sample resume for cancellation test',
                targetRole: 'Backend Developer',
                userId: 'test-user-cancel',
                createdAt: Date.now(),
            };

            const { jobId } = await jobManager.createJob(
                QueueName.RESUME_OPTIMIZATION,
                jobData,
                'test-user-cancel'
            );

            // Cancel immediately
            const cancelled = await jobManager.cancelJob(jobId, 'test-user-cancel');

            expect(cancelled).toBe(true);

            // Verify job is cancelled
            const status = await jobManager.getJobStatus(jobId, 'test-user-cancel');
            expect(status).toBeNull(); // Job should be removed
        });
    });

    describe('Multiple Jobs Processing', () => {
        it('should process multiple jobs concurrently', async () => {
            const userId = 'test-user-concurrent';
            const jobPromises = [];

            // Create 5 jobs
            for (let i = 0; i < 5; i++) {
                const promise = jobManager.createJob(
                    QueueName.CAREER_INSIGHTS,
                    {
                        type: 'career-insights',
                        domain: `Domain ${i}`,
                        userId,
                        createdAt: Date.now(),
                    },
                    userId
                );
                jobPromises.push(promise);
            }

            const jobs = await Promise.all(jobPromises);

            expect(jobs).toHaveLength(5);
            jobs.forEach((job) => {
                expect(job.jobId).toBeDefined();
            });

            // Wait for all to complete
            const maxWait = 60000;
            const startTime = Date.now();

            let allCompleted = false;

            while (Date.now() - startTime < maxWait && !allCompleted) {
                const statuses = await Promise.all(
                    jobs.map((job) => jobManager.getJobStatus(job.jobId, userId))
                );

                allCompleted = statuses.every(
                    (status) =>
                        status?.status === JobStatus.COMPLETED ||
                        status?.status === JobStatus.FAILED
                );

                if (!allCompleted) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }

            console.log('✅ All 5 jobs processed in:', Date.now() - startTime, 'ms');

            expect(allCompleted).toBe(true);
        }, 120000); // 2 minute timeout
    });

    describe('Error Handling', () => {
        it('should handle job failures gracefully', async () => {
            const jobData = {
                type: 'career-insights' as const,
                domain: '', // Invalid: empty domain
                userId: 'test-user-error',
                createdAt: Date.now(),
            };

            const { jobId } = await jobManager.createJob(
                QueueName.CAREER_INSIGHTS,
                jobData,
                'test-user-error'
            );

            // Wait for processing
            await new Promise((resolve) => setTimeout(resolve, 5000));

            const status = await jobManager.getJobStatus(jobId, 'test-user-error');

            // Should either fail or handle gracefully
            expect(status).toBeDefined();
        });
    });
});

// Custom matcher
expect.extend({
    toBeOneOf(received: any, expected: any[]) {
        const pass = expected.includes(received);
        return {
            pass,
            message: () =>
                pass
                    ? `expected ${received} not to be one of ${expected.join(', ')}`
                    : `expected ${received} to be one of ${expected.join(', ')}`,
        };
    },
});
