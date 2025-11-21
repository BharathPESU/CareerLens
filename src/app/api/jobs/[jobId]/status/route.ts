/**
 * GET /api/jobs/[jobId]/status
 * Get job status and result
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJobManager } from '@/lib/queue/job-manager';

export async function GET(
    request: NextRequest,
    { params }: { params: { jobId: string } }
) {
    try {
        const { jobId } = params;

        // TODO: Implement authentication
        const userId = request.headers.get('x-user-id') || 'user-123';

        const jobManager = getJobManager();
        const status = await jobManager.getJobStatus(jobId, userId);

        if (!status) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            ...status,
        });
    } catch (error) {
        console.error('❌ Error fetching job status:', error);

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
                error: 'Failed to fetch job status',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
