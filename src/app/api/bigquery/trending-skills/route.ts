import { NextRequest, NextResponse } from 'next/server';
import { getTrendingSkills } from '@/lib/bigquery/service';

/**
 * API Route: Get trending skills for an industry
 * GET /api/bigquery/trending-skills?industry=Technology&limit=10
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const industry = searchParams.get('industry');
        const limitParam = searchParams.get('limit');
        const limit = limitParam ? parseInt(limitParam, 10) : 10;

        if (!industry) {
            return NextResponse.json(
                { error: 'Industry parameter is required' },
                { status: 400 }
            );
        }

        const trendingSkills = await getTrendingSkills(industry, limit);

        return NextResponse.json({
            success: true,
            data: trendingSkills,
            count: trendingSkills.length,
        });
    } catch (error) {
        console.error('Error in trending skills API:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch trending skills',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
