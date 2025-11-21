/**
 * POST /api/jobs
 * Create and enqueue a background job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJobManager } from '@/lib/queue/job-manager';
import { QueueName, JobData } from '@/lib/queue/config';
import { auth } from '@/lib/auth'; // Assuming you have auth middleware

/**
 * Validate and sanitize job data
 */
function validateJobData(data: any): { valid: boolean; error?: string } {
    if (!data.type) {
        return { valid: false, error: 'Job type is required' };
    }

    if (!data.userId) {
        return { valid: false, error: 'User ID is required' };
    }

    // Type-specific validation
    switch (data.type) {
        case 'resume-optimization':
            if (!data.resumeText || !data.targetRole) {
                return {
                    valid: false,
                    error: 'Resume text and target role are required',
                };
            }
            break;

        case 'skill-gap-analysis':
            if (!data.targetRole || !data.industry || !data.currentSkills) {
                return {
                    valid: false,
                    error: 'Target role, industry, and current skills are required',
                };
            }
            break;

        case 'career-insights':
            if (!data.domain) {
                return { valid: false, error: 'Domain is required' };
            }
            break;

        case 'resume-generation':
            if (!data.resumeData) {
                return { valid: false, error: 'Resume data is required' };
            }
            break;

        default:
            return { valid: false, error: `Unknown job type: ${data.type}` };
    }

    return { valid: true };
}

/**
 * Map job type to queue name
 */
function getQueueNameForJobType(type: string): QueueName {
    switch (type) {
        case 'resume-generation':
            return QueueName.RESUME_GENERATION;
        case 'resume-optimization':
            return QueueName.RESUME_OPTIMIZATION;
        case 'skill-gap-analysis':
            return QueueName.SKILL_GAP_ANALYSIS;
        case 'career-insights':
            return QueueName.CAREER_INSIGHTS;
        case 'interview-prep':
            return QueueName.INTERVIEW_PREP;
        default:
            throw new Error(`Unknown job type: ${type}`);
    }
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        // TODO: Implement your authentication
        // const session = await auth(request);
        // if (!session?.user?.id) {
        //   return NextResponse.json(
        //     { error: 'Unauthorized' },
        //     { status: 401 }
        //   );
        // }
        // const userId = session.user.id;

        // For now, use a mock user ID (replace with real auth)
        const userId = request.headers.get('x-user-id') || 'user-123';

        // Parse request body
        const body = await request.json();

        // Add userId and timestamp to job data
        const jobData: JobData = {
            ...body,
            userId,
            createdAt: Date.now(),
        } as JobData;

        // Validate job data
        const validation = validateJobData(jobData);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error },
                { status: 400 }
            );
        }

        // Get queue name
        const queueName = getQueueNameForJobType(jobData.type);

        // Create job
        const jobManager = getJobManager();
        const result = await jobManager.createJob(queueName, jobData, userId);

        const processingTime = Date.now() - startTime;

        console.log(`✅ Job created in ${processingTime}ms:`, result.jobId);

        return NextResponse.json({
            success: true,
            jobId: result.jobId,
            status: result.status,
            message: 'Job queued successfully',
            metadata: {
                queueName,
                type: jobData.type,
                createdAt: jobData.createdAt,
                processingTime: `${processingTime}ms`,
            },
        });
    } catch (error) {
        console.error('❌ Error creating job:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create job',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/jobs
 * Get all active jobs for the current user
 */
export async function GET(request: NextRequest) {
    try {
        // TODO: Implement authentication
        const userId = request.headers.get('x-user-id') || 'user-123';

        const jobManager = getJobManager();
        const activeJobs = await jobManager.getUserActiveJobs(userId);

        return NextResponse.json({
            success: true,
            jobs: activeJobs,
            count: activeJobs.length,
        });
    } catch (error) {
        console.error('❌ Error fetching user jobs:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch jobs',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
