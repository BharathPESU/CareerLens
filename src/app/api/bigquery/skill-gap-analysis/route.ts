import { NextRequest, NextResponse } from 'next/server';
import { analyzeSkillGapWithAI, quickSkillMatch } from '@/ai/flows/analyze-skill-gap-ai';

/**
 * POST /api/bigquery/skill-gap-analysis
 * Real-time Gemini AI skill gap analysis with BigQuery market data
 */
export async function POST(request: NextRequest) {
    try {
        const { targetRole, currentSkills, industry, quick } = await request.json();

        // Validation
        if (!targetRole || !currentSkills || !Array.isArray(currentSkills)) {
            return NextResponse.json(
                { error: 'targetRole and currentSkills (array) are required' },
                { status: 400 }
            );
        }

        if (currentSkills.length === 0) {
            return NextResponse.json(
                { error: 'Please provide at least one skill' },
                { status: 400 }
            );
        }

        // Quick mode: fast skill match only
        if (quick) {
            const quickResult = await quickSkillMatch(
                targetRole,
                currentSkills,
                industry || 'Technology'
            );
            return NextResponse.json(quickResult);
        }

        // Full AI-powered skill gap analysis
        console.log(`🤖 Analyzing skill gap for ${targetRole} with Gemini AI...`);
        console.log(`📊 Current skills: ${currentSkills.join(', ')}`);

        const analysis = await analyzeSkillGapWithAI(
            targetRole,
            currentSkills,
            industry || 'Technology'
        );

        console.log(`✅ Analysis complete! Match: ${analysis.matchPercentage}%`);

        return NextResponse.json({
            success: true,
            data: analysis,
            timestamp: new Date().toISOString(),
            aiPowered: true,
        });

    } catch (error) {
        console.error('❌ Skill gap analysis error:', error);

        return NextResponse.json(
            {
                error: 'Failed to analyze skill gap',
                message: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/bigquery/skill-gap-analysis
 * Health check endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: 'active',
        service: 'Gemini AI Skill Gap Analyzer',
        features: [
            'Real-time AI analysis',
            'BigQuery market data integration',
            'Skill match percentage',
            'Missing skills identification',
            'Learning path recommendations',
            'Career readiness assessment',
            'Market context insights',
        ],
    });
}

