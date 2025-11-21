'use server';
/**
 * Enhanced Resume Optimizer Flow
 * Combines BigQuery job market data with Gemini AI for intelligent resume optimization
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getResumeKeywords, getSkillsForRole } from '@/lib/bigquery/service';

// Schema for Gemini AI response
const ResumeOptimizationSchema = z.object({
    atsScore: z.number().min(0).max(100).describe('ATS compatibility score'),
    overallQuality: z.number().min(0).max(100).describe('Overall resume quality'),

    keywordAnalysis: z.object({
        missingCriticalKeywords: z.array(z.string()).describe('Essential keywords missing from resume'),
        missingTrendingKeywords: z.array(z.string()).describe('Trending skills/keywords to add'),
        presentKeywords: z.array(z.string()).describe('Strong keywords already present'),
        keywordDensity: z.number().describe('Keyword density score 0-100'),
    }),

    actionVerbAnalysis: z.object({
        strongVerbsUsed: z.array(z.string()).describe('Effective action verbs found'),
        weakVerbsToReplace: z.array(z.object({
            weak: z.string(),
            suggested: z.string(),
        })).describe('Weak verbs to replace with stronger alternatives'),
        suggestedVerbs: z.array(z.string()).describe('Additional power verbs to consider'),
    }),

    improvementAreas: z.array(z.object({
        priority: z.enum(['critical', 'high', 'medium', 'low']),
        category: z.enum(['ats', 'keywords', 'impact', 'formatting', 'content']),
        issue: z.string(),
        recommendation: z.string(),
        example: z.string().optional(),
    })).describe('Prioritized improvement suggestions'),

    strengths: z.array(z.string()).describe('What the resume does well'),

    skillGapInsights: z.object({
        hasAllRequiredSkills: z.boolean(),
        missingRequiredSkills: z.array(z.string()),
        hasModernSkills: z.boolean(),
        skillMatchPercentage: z.number(),
    }),

    sectionFeedback: z.array(z.object({
        section: z.string(),
        score: z.number().min(0).max(10),
        feedback: z.string(),
        improvements: z.array(z.string()),
    })),

    quickWins: z.array(z.string()).describe('Easy improvements with high impact'),
});

export type ResumeOptimizationResult = z.infer<typeof ResumeOptimizationSchema>;

/**
 * Optimize resume with Gemini AI + BigQuery market data
 */
export async function optimizeResumeWithAI(
    resumeText: string,
    targetRole: string,
    industry: string = 'Technology'
): Promise<ResumeOptimizationResult> {
    try {
        // 1. Fetch real-time job market data from BigQuery
        const [marketKeywords, jobSkills] = await Promise.all([
            getResumeKeywords(targetRole, industry),
            getSkillsForRole(targetRole, industry),
        ]);

        // Extract comprehensive keyword lists
        const requiredSkills = jobSkills.flatMap(job => job.required_skills || []);
        const trendingSkills = jobSkills.flatMap(job => job.trending_skills || []);
        const marketAtsKeywords = jobSkills.flatMap(job => job.ats_keywords || []);

        const highImpactKeywords = marketKeywords?.high_impact_keywords || [];
        const atsKeywords = marketKeywords?.ats_keywords || [];
        const technicalSkills = marketKeywords?.technical_skills || [];
        const softSkills = marketKeywords?.soft_skills || [];
        const actionVerbs = marketKeywords?.action_verbs || [];
        const certifications = marketKeywords?.certifications || [];

        // 2. Create intelligent prompt for Gemini
        const prompt = ai.definePrompt({
            name: 'optimizeResumePrompt',
            model: 'googleai/gemini-2.0-flash-exp',
            input: {
                schema: z.object({
                    resumeText: z.string(),
                    targetRole: z.string(),
                    industry: z.string(),
                    requiredSkills: z.array(z.string()),
                    trendingSkills: z.array(z.string()),
                    highImpactKeywords: z.array(z.string()),
                    atsKeywords: z.array(z.string()),
                    technicalSkills: z.array(z.string()),
                    softSkills: z.array(z.string()),
                    actionVerbs: z.array(z.string()),
                    certifications: z.array(z.string()),
                }),
            },
            output: {
                schema: ResumeOptimizationSchema,
            },
            prompt: `
You are an elite resume optimization AI with access to REAL-TIME job market data from BigQuery.

**Target Role:** {{targetRole}}
**Industry:** {{industry}}

**REAL JOB MARKET DATA (from BigQuery):**

Required Skills (CRITICAL to include):
{{#each requiredSkills}}
- {{this}}
{{/each}}

Trending Skills (HIGH VALUE to mention):
{{#each trendingSkills}}
- {{this}}
{{/each}}

High-Impact Keywords (BOOST ATS score):
{{#each highImpactKeywords}}
- {{this}}
{{/each}}

ATS System Keywords (MUST HAVE for parsing):
{{#each atsKeywords}}
- {{this}}
{{/each}}

Technical Skills Expected:
{{#each technicalSkills}}
- {{this}}
{{/each}}

Soft Skills Valued:
{{#each softSkills}}
- {{this}}
{{/each}}

Powerful Action Verbs:
{{#each actionVerbs}}
- {{this}}
{{/each}}

Recommended Certifications:
{{#each certifications}}
- {{this}}
{{/each}}

---

**RESUME TO OPTIMIZE:**

{{resumeText}}

---

**YOUR TASK:**

Analyze this resume against REAL job market data and provide:

1. **ATS Score (0-100)**:
   - Check if resume contains critical ATS keywords
   - Verify proper formatting for ATS parsing
   - Assess keyword density (not too sparse, not stuffed)
   - Standard section headers present?
   - Contact info visible?

2. **Keyword Analysis**:
   - Which CRITICAL keywords from job market are MISSING?
   - Which TRENDING keywords should be added?
   - Which keywords are already PRESENT and strong?
   - Calculate keyword density score

3. **Action Verb Analysis**:
   - Identify strong action verbs already used
   - Find weak verbs that should be replaced (e.g., "worked on", "responsible for")
   - Suggest specific power verbs from the market data
   - Match verbs to achievements

4. **Improvement Areas** (prioritized):
   - CRITICAL: ATS blockers, missing must-have keywords
   - HIGH: Skill gaps, weak bullet points, missing impact metrics
   - MEDIUM: Keyword optimization, formatting improvements
   - LOW: Polish, minor enhancements

5. **Strengths**:
   - What does this resume do exceptionally well?
   - Which market-relevant skills are showcased?
   - Strong formatting or impact statements?

6. **Skill Gap Insights**:
   - Does resume mention all required skills?
   - Are modern/trending skills present?
   - Calculate skill match percentage vs. market

7. **Section-by-Section Feedback**:
   - Rate each section 0-10
   - Specific feedback per section
   - 2-3 actionable improvements per section

8. **Quick Wins**:
   - 5-7 EASY changes with HIGH impact
   - Simple keyword additions
   - Verb replacements
   - Format tweaks

**CRITICAL RULES:**
- Base ALL recommendations on the REAL market data provided
- Be SPECIFIC with examples
- Prioritize changes by impact
- Focus on ATS compatibility + human readability
- Consider both technical accuracy and storytelling
- Flag any critical omissions

Provide constructive, actionable, data-driven feedback!
`,
        });

        // 3. Run AI analysis
        const response = await prompt({
            resumeText,
            targetRole,
            industry,
            requiredSkills: [...new Set(requiredSkills)].slice(0, 30),
            trendingSkills: [...new Set(trendingSkills)].slice(0, 20),
            highImpactKeywords,
            atsKeywords: [...new Set([...atsKeywords, ...marketAtsKeywords])].slice(0, 25),
            technicalSkills,
            softSkills,
            actionVerbs,
            certifications,
        });

        if (!response.output) {
            throw new Error('Failed to get optimization response from AI');
        }

        return response.output;

    } catch (error) {
        console.error('Error optimizing resume with AI:', error);

        // Fallback response if AI fails
        return {
            atsScore: 0,
            overallQuality: 0,
            keywordAnalysis: {
                missingCriticalKeywords: ['Error analyzing resume'],
                missingTrendingKeywords: [],
                presentKeywords: [],
                keywordDensity: 0,
            },
            actionVerbAnalysis: {
                strongVerbsUsed: [],
                weakVerbsToReplace: [],
                suggestedVerbs: [],
            },
            improvementAreas: [{
                priority: 'critical',
                category: 'ats',
                issue: 'Analysis failed',
                recommendation: 'Please try again or check your resume format',
            }],
            strengths: [],
            skillGapInsights: {
                hasAllRequiredSkills: false,
                missingRequiredSkills: [],
                hasModernSkills: false,
                skillMatchPercentage: 0,
            },
            sectionFeedback: [],
            quickWins: [],
        };
    }
}

/**
 * Quick keyword check (faster, lightweight)
 */
export async function quickKeywordCheck(
    resumeText: string,
    targetRole: string,
    industry: string = 'Technology'
): Promise<{
    atsScore: number;
    missingKeywords: string[];
    presentKeywords: string[];
}> {
    try {
        const marketKeywords = await getResumeKeywords(targetRole, industry);

        if (!marketKeywords) {
            return {
                atsScore: 0,
                missingKeywords: ['Unable to fetch market data'],
                presentKeywords: [],
            };
        }

        const normalizedResume = resumeText.toLowerCase();
        const allMarketKeywords = [
            ...marketKeywords.ats_keywords,
            ...marketKeywords.technical_skills,
        ];

        const present: string[] = [];
        const missing: string[] = [];

        allMarketKeywords.forEach(keyword => {
            if (normalizedResume.includes(keyword.toLowerCase())) {
                present.push(keyword);
            } else {
                missing.push(keyword);
            }
        });

        const atsScore = allMarketKeywords.length > 0
            ? Math.round((present.length / allMarketKeywords.length) * 100)
            : 0;

        return {
            atsScore,
            missingKeywords: missing,
            presentKeywords: present,
        };
    } catch (error) {
        console.error('Quick keyword check error:', error);
        return {
            atsScore: 0,
            missingKeywords: [],
            presentKeywords: [],
        };
    }
}
