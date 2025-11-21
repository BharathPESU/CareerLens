'use server';
/**
 * Gemini AI-Powered Skill Gap Analysis
 * Real-time intelligent skill matching with BigQuery market data
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getSkillsForRole, getTrendingSkills } from '@/lib/bigquery/service';

// Schema for Gemini AI response
const SkillGapAnalysisSchema = z.object({
    matchPercentage: z.number().min(0).max(100).describe('Overall skill match percentage'),
    skillAlignment: z.enum(['excellent', 'good', 'fair', 'poor']).describe('Overall alignment level'),

    skillBreakdown: z.object({
        matchedSkills: z.array(z.object({
            skill: z.string(),
            proficiencyLevel: z.enum(['expert', 'advanced', 'intermediate', 'beginner']),
            marketDemand: z.enum(['critical', 'high', 'medium', 'low']),
        })).describe('Skills you have that match the role'),

        missingCriticalSkills: z.array(z.object({
            skill: z.string(),
            importance: z.enum(['must-have', 'highly-recommended', 'nice-to-have']),
            learnability: z.enum(['easy', 'moderate', 'challenging']),
            timeToLearn: z.string().describe('Estimated time to learn, e.g., "2-3 months"'),
        })).describe('Critical skills you need to acquire'),

        emergingSkills: z.array(z.object({
            skill: z.string(),
            trendScore: z.number().describe('How trending this skill is, 0-10'),
            futureValue: z.enum(['very-high', 'high', 'medium', 'low']),
        })).describe('Trending skills that will increase your market value'),
    }),

    recommendations: z.array(z.object({
        priority: z.enum(['immediate', 'short-term', 'long-term']),
        category: z.enum(['technical', 'soft-skills', 'tools', 'certifications']),
        action: z.string(),
        rationale: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
    })).describe('Prioritized recommendations'),

    careerInsights: z.object({
        readinessLevel: z.enum(['ready', 'almost-ready', 'needs-preparation', 'significant-gap']),
        estimatedTimeToReady: z.string().describe('Time needed to be job-ready'),
        strengthAreas: z.array(z.string()),
        weaknessAreas: z.array(z.string()),
        competitiveAdvantages: z.array(z.string()),
    }),

    learningPath: z.array(z.object({
        phase: z.string(),
        duration: z.string(),
        skills: z.array(z.string()),
        resources: z.array(z.string()),
    })).describe('Suggested learning path to bridge the gap'),

    marketContext: z.object({
        demandLevel: z.enum(['very-high', 'high', 'moderate', 'low']),
        competitionLevel: z.enum(['very-competitive', 'competitive', 'moderate', 'low']),
        salaryOutlook: z.string(),
        jobOpenings: z.string(),
    }),
});

export type SkillGapAnalysisResult = z.infer<typeof SkillGapAnalysisSchema>;

/**
 * Analyze skill gap with Gemini AI + BigQuery market data
 */
export async function analyzeSkillGapWithAI(
    targetRole: string,
    currentSkills: string[],
    industry: string = 'Technology'
): Promise<SkillGapAnalysisResult> {
    try {
        // 1. Fetch real-time job market data from BigQuery
        const [jobSkills, trendingSkillsData] = await Promise.all([
            getSkillsForRole(targetRole, industry),
            getTrendingSkills(industry, 20),
        ]);

        // Extract comprehensive skill requirements
        const requiredSkills = jobSkills.flatMap(job => job.required_skills || []);
        const trendingSkills = [
            ...jobSkills.flatMap(job => job.trending_skills || []),
            ...trendingSkillsData.map(skill =>
                typeof skill === 'string' ? skill : skill.skill
            ),
        ];
        const atsKeywords = jobSkills.flatMap(job => job.ats_keywords || []);

        // Get unique skills
        const uniqueRequired = [...new Set(requiredSkills)];
        const uniqueTrending = [...new Set(trendingSkills)];

        // 2. Create intelligent Gemini AI prompt
        const prompt = ai.definePrompt({
            name: 'analyzeSkillGapPrompt',
            model: 'googleai/gemini-2.0-flash-exp',
            input: {
                schema: z.object({
                    targetRole: z.string(),
                    industry: z.string(),
                    currentSkills: z.array(z.string()),
                    marketRequiredSkills: z.array(z.string()),
                    marketTrendingSkills: z.array(z.string()),
                    atsKeywords: z.array(z.string()),
                }),
            },
            output: {
                schema: SkillGapAnalysisSchema,
            },
            prompt: `
You are an elite career counselor and skill gap analyst with access to REAL-TIME job market data from BigQuery.

**ANALYSIS REQUEST:**

**Target Role:** {{targetRole}}
**Industry:** {{industry}}

**Candidate's Current Skills:**
{{#each currentSkills}}
• {{this}}
{{/each}}

---

**REAL JOB MARKET DATA (from BigQuery):**

**Skills REQUIRED by Employers (CRITICAL):**
{{#each marketRequiredSkills}}
• {{this}}
{{/each}}

**Skills TRENDING in {{industry}} (HIGH VALUE):**
{{#each marketTrendingSkills}}
• {{this}}
{{/each}}

**ATS Keywords for {{targetRole}}:**
{{#each atsKeywords}}
• {{this}}
{{/each}}

---

**YOUR TASK:**

Perform a comprehensive, intelligent skill gap analysis:

### 1. **Calculate Match Percentage (0-100%)**
- Compare candidate's skills to market required skills
- Weight critical skills higher than nice-to-haves
- Consider skill variations (e.g., "React" = "React.js" = "ReactJS")
- Factor in transferable skills
- Be accurate and realistic

### 2. **Skill Breakdown**

**Matched Skills:**
- List skills the candidate HAS that match job requirements
- Assess proficiency level based on skill context
- Indicate market demand for each skill

**Missing Critical Skills:**
- Identify MUST-HAVE skills the candidate LACKS
- Categorize by importance (must-have / highly-recommended / nice-to-have)
- Estimate learning difficulty
- Provide realistic time-to-learn estimates

**Emerging Skills:**
- Identify trending skills that will increase market value
- Assign trend score (0-10)
- Assess future value

### 3. **Recommendations**

Provide 5-10 prioritized recommendations:
- **IMMEDIATE**: Critical gaps that block job applications
- **SHORT-TERM**: High-impact skills to learn in 1-3 months
- **LONG-TERM**: Advanced skills for career growth

Categories:
- Technical skills
- Soft skills  
- Tools & technologies
- Certifications

For each:
- Specific action to take
- Clear rationale
- Expected impact

### 4. **Career Insights**

**Readiness Assessment:**
- Ready: Can apply now
- Almost Ready: 1-2 skills away
- Needs Preparation: 3-6 months needed
- Significant Gap: 6+ months needed

**Estimate:**
- Realistic time to become job-ready
- Strengths to leverage
- Weaknesses to address
- Competitive advantages

### 5. **Learning Path**

Create a phased learning plan:
- Phase 1: Foundation (critical gaps)
- Phase 2: Advancement (high-value skills)
- Phase 3: Specialization (emerging tech)

For each phase:
- Duration
- Skills to master
- Resource types (online courses, projects, certifications)

### 6. **Market Context**

Provide insights on:
- Current demand level for this role
- Competition level
- Salary outlook
- Typical job openings count

---

**CRITICAL ANALYSIS RULES:**

1. **Be Honest**: Don't inflate match percentage
2. **Be Specific**: "Learn React.js" not "Learn web development"
3. **Be Realistic**: Accurate time estimates
4. **Be Constructive**: Focus on actionable steps
5. **Use Market Data**: Base ALL recommendations on the real market data provided
6. **Consider Context**: Some skills imply others (e.g., React → JavaScript)
7. **Prioritize Impact**: Focus on skills that matter most
8. **Be Encouraging**: Highlight strengths while addressing gaps

Return detailed, actionable insights that will genuinely help the candidate!
`,
        });

        // 3. Run AI analysis
        const response = await prompt({
            targetRole,
            industry,
            currentSkills,
            marketRequiredSkills: uniqueRequired.slice(0, 30),
            marketTrendingSkills: uniqueTrending.slice(0, 25),
            atsKeywords: [...new Set(atsKeywords)].slice(0, 20),
        });

        if (!response.output) {
            throw new Error('Failed to get skill gap analysis from AI');
        }

        return response.output;

    } catch (error) {
        console.error('Error analyzing skill gap with AI:', error);

        // Fallback response
        return {
            matchPercentage: 0,
            skillAlignment: 'poor',
            skillBreakdown: {
                matchedSkills: [],
                missingCriticalSkills: [{
                    skill: 'Error occurred',
                    importance: 'must-have',
                    learnability: 'moderate',
                    timeToLearn: 'N/A',
                }],
                emergingSkills: [],
            },
            recommendations: [{
                priority: 'immediate',
                category: 'technical',
                action: 'Please try again',
                rationale: 'Analysis failed',
                impact: 'high',
            }],
            careerInsights: {
                readinessLevel: 'significant-gap',
                estimatedTimeToReady: 'Unable to determine',
                strengthAreas: [],
                weaknessAreas: ['Analysis error'],
                competitiveAdvantages: [],
            },
            learningPath: [],
            marketContext: {
                demandLevel: 'moderate',
                competitionLevel: 'moderate',
                salaryOutlook: 'Unable to determine',
                jobOpenings: '0',
            },
        };
    }
}

/**
 * Quick skill match check (lightweight)
 */
export async function quickSkillMatch(
    targetRole: string,
    currentSkills: string[],
    industry: string = 'Technology'
): Promise<{
    matchPercentage: number;
    matchedCount: number;
    missingCount: number;
}> {
    try {
        const jobSkills = await getSkillsForRole(targetRole, industry);
        const requiredSkills = [...new Set(jobSkills.flatMap(job => job.required_skills || []))];

        const normalizedCurrent = currentSkills.map(s => s.toLowerCase().trim());
        const normalizedRequired = requiredSkills.map(s => s.toLowerCase().trim());

        const matchedCount = normalizedCurrent.filter(skill =>
            normalizedRequired.some(req =>
                req.includes(skill) || skill.includes(req)
            )
        ).length;

        const matchPercentage = requiredSkills.length > 0
            ? Math.round((matchedCount / requiredSkills.length) * 100)
            : 0;

        return {
            matchPercentage,
            matchedCount,
            missingCount: requiredSkills.length - matchedCount,
        };
    } catch (error) {
        console.error('Quick skill match error:', error);
        return {
            matchPercentage: 0,
            matchedCount: 0,
            missingCount: 0,
        };
    }
}
