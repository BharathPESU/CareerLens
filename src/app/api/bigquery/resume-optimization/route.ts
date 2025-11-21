import { NextRequest, NextResponse } from 'next/server';
import { getResumeOptimization } from '@/lib/bigquery/service';
import { optimizeResumeWithAI, quickKeywordCheck } from '@/ai/flows/optimize-resume-ai';

/**
 * POST /api/bigquery/resume-optimization
 * Real-time Gemini AI resume optimization with BigQuery market data
 */
export async function POST(request: NextRequest) {
    try {
        const { role, resumeText, industry, quick } = await request.json();

        // Validation
        if (!role || !resumeText) {
            return NextResponse.json(
                { error: 'Missing required fields: role and resumeText are required' },
                { status: 400 }
            );
        }

        if (resumeText.length < 50) {
            return NextResponse.json(
                { error: 'Resume text too short. Please provide a complete resume.' },
                { status: 400 }
            );
        }

        // Quick mode: fast keyword check only
        if (quick) {
            const quickResult = await quickKeywordCheck(
                resumeText,
                role,
                industry || 'Technology'
            );
            return NextResponse.json(quickResult);
        }

        // Full AI-powered optimization
        console.log(`🤖 Optimizing resume for ${role} with Gemini AI...`);

        const optimization = await optimizeResumeWithAI(
            resumeText,
            role,
            industry || 'Technology'
        );

        console.log(`✅ Optimization complete! ATS Score: ${optimization.atsScore}%`);

        return NextResponse.json({
            success: true,
            data: optimization,
            timestamp: new Date().toISOString(),
            aiPowered: true,
        });

    } catch (error) {
        console.error('❌ Resume optimization error:', error);

        return NextResponse.json(
            {
                error: 'Failed to optimize resume',
                message: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/bigquery/resume-optimization
 * Health check endpoint
 */
export async function GET() {
    return NextResponse.json({
        status: 'active',
        service: 'Gemini AI Resume Optimizer',
        features: [
            'Real-time AI analysis',
            'BigQuery market data integration',
            'ATS compatibility scoring',
            'Keyword gap analysis',
            'Action verb optimization',
            'Section-by-section feedback',
        ],
    });
}
