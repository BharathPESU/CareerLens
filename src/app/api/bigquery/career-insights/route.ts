import { NextRequest, NextResponse } from 'next/server';
import { analyzeCareerInsightsWithAI, getQuickCareerInsights } from '@/ai/flows/analyze-career-insights-ai';

/**
 * Gemini AI Career Insights API
 * 
 * GET /api/bigquery/career-insights?domain=Full Stack Development&mode=full
 * 
 * Query Parameters:
 * - domain (required): Career domain/field to analyze
 * - currentRole (optional): Current role/position
 * - experienceLevel (optional): Entry | Mid | Senior | Lead
 * - location (optional): Geographic location
 * - mode (optional): 'full' (AI analysis) or 'quick' (preview only)
 */
export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        const searchParams = request.nextUrl.searchParams;
        const domain = searchParams.get('domain');
        const currentRole = searchParams.get('currentRole') || undefined;
        const experienceLevel = searchParams.get('experienceLevel') as any || 'Mid';
        const location = searchParams.get('location') || undefined;
        const mode = searchParams.get('mode') || 'full';

        // Validation
        if (!domain) {
            return NextResponse.json(
                { error: 'Domain parameter is required' },
                { status: 400 }
            );
        }

        console.log('📊 Career Insights Request:', {
            domain,
            currentRole,
            experienceLevel,
            location,
            mode
        });

        // Quick mode: Fast preview without full AI analysis
        if (mode === 'quick') {
            const quickInsights = await getQuickCareerInsights(domain);
            return NextResponse.json({
                success: true,
                mode: 'quick',
                data: quickInsights,
                processingTime: `${Date.now() - startTime}ms`
            });
        }

        // Full AI analysis
        const insights = await analyzeCareerInsightsWithAI({
            domain,
            currentRole,
            experienceLevel,
            location
        });

        const processingTime = Date.now() - startTime;
        console.log(`✅ Career Insights Complete (${processingTime}ms)`);

        return NextResponse.json({
            success: true,
            mode: 'ai-powered',
            data: {
                ...insights,
                domain, // Ensure domain is included
            },
            metadata: {
                processingTime: `${processingTime}ms`,
                model: 'gemini-2.0-flash-exp',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Error in career insights API:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to analyze career insights',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}

/**
 * Health check endpoint
 */
export async function POST(request: NextRequest) {
    return NextResponse.json({
        status: 'healthy',
        service: 'Gemini AI Career Insights',
        timestamp: new Date().toISOString()
    });
}
