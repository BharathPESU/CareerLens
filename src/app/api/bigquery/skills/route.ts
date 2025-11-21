import { NextRequest, NextResponse } from 'next/server';
import { getSkillsForRole } from '@/lib/bigquery/service';

/**
 * API Route: Get skills for a specific role
 * GET /api/bigquery/skills?role=Full Stack Developer&industry=Technology
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

        const skills = await getSkillsForRole(role, industry);

        return NextResponse.json({
            success: true,
            data: skills,
            count: skills.length,
        });
    } catch (error) {
        console.error('Error in skills API:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch skills data',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
