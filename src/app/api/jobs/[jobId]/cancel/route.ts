/**
 * POST /api/jobs/[jobId]/cancel
 * Cancel a job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJobManager } from '@/lib/queue/job-manager';

export async function POST(
    request: NextRequest,
    { params }: { params: { jobId: string } }
) {
    try {
        const { jobId } = params;

        // TODO: Implement authentication
        const userId = request.headers.get('x-user-id') || 'user-123';

        const jobManager = getJobManager();
        const cancelled = await jobManager.cancelJob(jobId, userId);

        if (!cancelled) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Job cannot be cancelled (already completed or not found)',
                },
                { status: 400 }
            );
        }

        console.log(`✅ Job cancelled: ${jobId}`);

        return NextResponse.json({
            success: true,
            message: 'Job cancelled successfully',
            jobId,
        });
    } catch (error) {
        console.error('❌ Error cancelling job:', error);

        // Check if it's an authorization error
        if (error instanceof Error && error.message.includes('Unauthorized')) {
            return NextResponse.json(
                { error: 'Unauthorized', message: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to cancel job',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
