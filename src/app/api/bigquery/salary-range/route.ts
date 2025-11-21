import { NextRequest, NextResponse } from 'next/server';
import { getSalaryRange } from '@/lib/bigquery/service';

/**
 * API Route: Get salary range for a role
 * GET /api/bigquery/salary-range?role=Full Stack Developer&region=United States
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role');
        const region = searchParams.get('region') || undefined;

        if (!role) {
            return NextResponse.json(
                { error: 'Role parameter is required' },
                { status: 400 }
            );
        }

        const salaryRange = await getSalaryRange(role, region);

        if (!salaryRange) {
            return NextResponse.json(
                { error: 'No salary data found for this role' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: salaryRange,
        });
    } catch (error) {
        console.error('Error in salary range API:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch salary range',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
