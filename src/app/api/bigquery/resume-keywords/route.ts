import { NextRequest, NextResponse } from 'next/server';
import { getResumeKeywords } from '@/lib/bigquery/service';

/**
 * API Route: Get resume keywords for optimization
 * GET /api/bigquery/resume-keywords?role=Data Scientist&industry=Technology
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const role = searchParams.get('role');
        const industry = searchParams.get('industry') || undefined;

        if (!role) {
            return NextResponse.json(
                { error: 'Role parameter is required' },
                { status: 400 }
            );
        }

        const keywords = await getResumeKeywords(role, industry);

        if (!keywords) {
            return NextResponse.json(
                { error: 'No keywords found for this role' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: keywords,
        });
    } catch (error) {
        console.error('Error in resume keywords API:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch resume keywords',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
