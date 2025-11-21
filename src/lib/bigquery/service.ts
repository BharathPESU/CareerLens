import { bigQueryClient, getTableId, BQ_CONFIG, isBigQueryConfigured } from './config';

/**
 * BigQuery Service for CareerLens Resume Builder
 * 
 * Provides methods to query job market data, resume keywords, and career insights
 */

export interface JobMarketData {
    job_id: string;
    job_role: string;
    industry: string;
    required_skills: string[];
    trending_skills: string[];
    average_salary: number;
    salary_min: number;
    salary_max: number;
    region: string;
    experience_level: string;
    demand_score: number;
    ats_keywords: string[];
    job_description: string;
    company_size: string;
    remote_friendly: boolean;
}

export interface ResumeKeywords {
    keyword_id: string;
    role: string;
    industry: string;
    high_impact_keywords: string[];
    ats_keywords: string[];
    soft_skills: string[];
    technical_skills: string[];
    action_verbs: string[];
    certifications: string[];
    keyword_weight: number;
    effectiveness_score: number;
}

export interface CareerInsights {
    insight_id: string;
    domain: string;
    future_opportunities: string[];
    certifications: string[];
    demand_score: number;
    growth_rate: number;
    avg_career_progression_years: number;
    top_companies: string[];
    emerging_technologies: string[];
    skill_gap_analysis: string;
    salary_growth_potential: number;
    job_openings_count: number;
    geographic_hotspots: string[];
}

export interface SkillGapAnalysis {
    role: string;
    requiredSkills: string[];
    trendingSkills: string[];
    missingSkills: string[];
    matchPercentage: number;
    recommendations: string[];
}

export interface ResumeOptimizationSuggestions {
    atsScore: number;
    missingKeywords: string[];
    suggestedKeywords: string[];
    actionVerbs: string[];
    improvementAreas: string[];
    strengths: string[];
}

/**
 * Get skills for a specific role
 */
export async function getSkillsForRole(
    role: string,
    industry?: string
): Promise<JobMarketData[]> {
    if (!isBigQueryConfigured()) {
        return getMockSkillsForRole(role);
    }

    try {
        const query = `
      SELECT 
        job_role,
        industry,
        required_skills,
        trending_skills,
        average_salary,
        salary_min,
        salary_max,
        demand_score,
        ats_keywords,
        experience_level,
        region
      FROM \`${getTableId(BQ_CONFIG.tables.jobMarketData)}\`
      WHERE LOWER(job_role) LIKE LOWER(@role)
      ${industry ? 'AND LOWER(industry) = LOWER(@industry)' : ''}
      ORDER BY demand_score DESC
      LIMIT 20
    `;

        const options = {
            query,
            params: { role: `%${role}%`, ...(industry && { industry }) },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows as JobMarketData[];
    } catch (error) {
        console.error('Error querying BigQuery for skills:', error);
        return getMockSkillsForRole(role);
    }
}

/**
 * Get trending skills for an industry
 */
export async function getTrendingSkills(
    industry: string,
    limit: number = 10
): Promise<{ skill: string; demand_score: number; frequency: number }[]> {
    if (!isBigQueryConfigured()) {
        return getMockTrendingSkills(industry);
    }

    try {
        const query = `
      WITH skills_unnested AS (
        SELECT 
          skill,
          demand_score
        FROM \`${getTableId(BQ_CONFIG.tables.jobMarketData)}\`,
        UNNEST(trending_skills) AS skill
        WHERE LOWER(industry) = LOWER(@industry)
      )
      SELECT 
        skill,
        AVG(demand_score) as demand_score,
        COUNT(*) as frequency
      FROM skills_unnested
      GROUP BY skill
      ORDER BY demand_score DESC, frequency DESC
      LIMIT @limit
    `;

        const options = {
            query,
            params: { industry, limit },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows as { skill: string; demand_score: number; frequency: number }[];
    } catch (error) {
        console.error('Error querying trending skills:', error);
        return getMockTrendingSkills(industry);
    }
}

/**
 * Get high-impact keywords for resume optimization
 */
export async function getResumeKeywords(
    role: string,
    industry?: string
): Promise<ResumeKeywords | null> {
    if (!isBigQueryConfigured()) {
        return getMockResumeKeywords(role);
    }

    try {
        const query = `
      SELECT 
        role,
        industry,
        high_impact_keywords,
        ats_keywords,
        soft_skills,
        technical_skills,
        action_verbs,
        certifications,
        keyword_weight,
        effectiveness_score
      FROM \`${getTableId(BQ_CONFIG.tables.resumeKeywords)}\`
      WHERE LOWER(role) = LOWER(@role)
      ${industry ? 'AND LOWER(industry) = LOWER(@industry)' : ''}
      ORDER BY effectiveness_score DESC
      LIMIT 1
    `;

        const options = {
            query,
            params: { role, ...(industry && { industry }) },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows.length > 0 ? (rows[0] as ResumeKeywords) : getMockResumeKeywords(role);
    } catch (error) {
        console.error('Error querying resume keywords:', error);
        return getMockResumeKeywords(role);
    }
}

/**
 * Get career insights for a domain
 */
export async function getCareerInsights(domain: string): Promise<CareerInsights | null> {
    if (!isBigQueryConfigured()) {
        return getMockCareerInsights(domain);
    }

    try {
        const query = `
      SELECT 
        domain,
        future_opportunities,
        certifications,
        demand_score,
        growth_rate,
        avg_career_progression_years,
        top_companies,
        emerging_technologies,
        skill_gap_analysis,
        salary_growth_potential,
        job_openings_count,
        geographic_hotspots
      FROM \`${getTableId(BQ_CONFIG.tables.careerInsights)}\`
      WHERE LOWER(domain) LIKE LOWER(@domain)
      ORDER BY demand_score DESC
      LIMIT 1
    `;

        const options = {
            query,
            params: { domain: `%${domain}%` },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows.length > 0 ? (rows[0] as CareerInsights) : getMockCareerInsights(domain);
    } catch (error) {
        console.error('Error querying career insights:', error);
        return getMockCareerInsights(domain);
    }
}

/**
 * Get salary range for a role
 */
export async function getSalaryRange(
    role: string,
    region?: string
): Promise<{ min: number; max: number; average: number } | null> {
    if (!isBigQueryConfigured()) {
        return { min: 80000, max: 150000, average: 115000 };
    }

    try {
        const query = `
      SELECT 
        AVG(salary_min) as min,
        AVG(salary_max) as max,
        AVG(average_salary) as average
      FROM \`${getTableId(BQ_CONFIG.tables.jobMarketData)}\`
      WHERE LOWER(job_role) LIKE LOWER(@role)
      ${region ? 'AND LOWER(region) = LOWER(@region)' : ''}
    `;

        const options = {
            query,
            params: { role: `%${role}%`, ...(region && { region }) },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error querying salary range:', error);
        return { min: 80000, max: 150000, average: 115000 };
    }
}

/**
 * Analyze skill gap for a resume
 */
export async function analyzeSkillGap(
    targetRole: string,
    currentSkills: string[],
    industry?: string
): Promise<SkillGapAnalysis> {
    const jobData = await getSkillsForRole(targetRole, industry);

    if (jobData.length === 0) {
        return {
            role: targetRole,
            requiredSkills: [],
            trendingSkills: [],
            missingSkills: [],
            matchPercentage: 0,
            recommendations: ['Unable to find job data for this role.'],
        };
    }

    // Aggregate all required and trending skills
    const allRequiredSkills = new Set<string>();
    const allTrendingSkills = new Set<string>();

    jobData.forEach((job) => {
        job.required_skills?.forEach((skill) => allRequiredSkills.add(skill.toLowerCase()));
        job.trending_skills?.forEach((skill) => allTrendingSkills.add(skill.toLowerCase()));
    });

    const requiredSkillsArray = Array.from(allRequiredSkills);
    const trendingSkillsArray = Array.from(allTrendingSkills);

    // Normalize current skills
    const normalizedCurrentSkills = currentSkills.map((s) => s.toLowerCase());

    // Find missing skills
    const missingRequiredSkills = requiredSkillsArray.filter(
        (skill) => !normalizedCurrentSkills.includes(skill)
    );
    const missingTrendingSkills = trendingSkillsArray.filter(
        (skill) => !normalizedCurrentSkills.includes(skill) && !missingRequiredSkills.includes(skill)
    );

    // Calculate match percentage
    const totalRequiredSkills = requiredSkillsArray.length;
    const matchedSkills = totalRequiredSkills - missingRequiredSkills.length;
    const matchPercentage = totalRequiredSkills > 0
        ? Math.round((matchedSkills / totalRequiredSkills) * 100)
        : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    if (missingRequiredSkills.length > 0) {
        recommendations.push(
            `Focus on acquiring these essential skills: ${missingRequiredSkills.slice(0, 5).join(', ')}`
        );
    }
    if (missingTrendingSkills.length > 0) {
        recommendations.push(
            `Consider learning these trending skills to stay competitive: ${missingTrendingSkills.slice(0, 5).join(', ')}`
        );
    }
    if (matchPercentage >= 80) {
        recommendations.push('Great match! You have most of the required skills for this role.');
    } else if (matchPercentage >= 60) {
        recommendations.push('Good foundation. Focus on filling the skill gaps to become more competitive.');
    } else {
        recommendations.push('Significant skill gap detected. Consider focused learning or transitional roles.');
    }

    return {
        role: targetRole,
        requiredSkills: requiredSkillsArray,
        trendingSkills: trendingSkillsArray,
        missingSkills: [...missingRequiredSkills, ...missingTrendingSkills],
        matchPercentage,
        recommendations,
    };
}

/**
 * Get resume optimization suggestions based on keywords
 */
export async function getResumeOptimization(
    role: string,
    resumeText: string,
    industry?: string
): Promise<ResumeOptimizationSuggestions> {
    const keywords = await getResumeKeywords(role, industry);

    if (!keywords) {
        return {
            atsScore: 0,
            missingKeywords: [],
            suggestedKeywords: [],
            actionVerbs: [],
            improvementAreas: ['Unable to fetch keyword data for this role.'],
            strengths: [],
        };
    }

    // Normalize resume text for comparison
    const normalizedResume = resumeText.toLowerCase();

    // Check for missing ATS keywords
    const missingAtsKeywords = keywords.ats_keywords.filter(
        (kw) => !normalizedResume.includes(kw.toLowerCase())
    );

    // Check for missing high-impact keywords
    const missingHighImpactKeywords = keywords.high_impact_keywords.filter(
        (kw) => !normalizedResume.includes(kw.toLowerCase())
    );

    // Check for action verbs
    const usedActionVerbs = keywords.action_verbs.filter(
        (verb) => normalizedResume.includes(verb.toLowerCase())
    );
    const missingActionVerbs = keywords.action_verbs.filter(
        (verb) => !normalizedResume.includes(verb.toLowerCase())
    );

    // Calculate ATS score
    const totalKeywords = keywords.ats_keywords.length;
    const foundKeywords = totalKeywords - missingAtsKeywords.length;
    const atsScore = totalKeywords > 0
        ? Math.round((foundKeywords / totalKeywords) * 100)
        : 0;

    // Generate suggestions
    const improvementAreas: string[] = [];
    const strengths: string[] = [];

    if (missingAtsKeywords.length > 0) {
        improvementAreas.push(
            `Add ${missingAtsKeywords.length} critical ATS keywords: ${missingAtsKeywords.slice(0, 5).join(', ')}`
        );
    }

    if (missingHighImpactKeywords.length > 0) {
        improvementAreas.push(
            `Include high-impact keywords: ${missingHighImpactKeywords.slice(0, 3).join(', ')}`
        );
    }

    if (missingActionVerbs.length > keywords.action_verbs.length * 0.5) {
        improvementAreas.push(
            `Use more action verbs like: ${missingActionVerbs.slice(0, 5).join(', ')}`
        );
    }

    if (usedActionVerbs.length >= keywords.action_verbs.length * 0.5) {
        strengths.push(`Good use of action verbs (${usedActionVerbs.length} found)`);
    }

    if (atsScore >= 70) {
        strengths.push('Strong ATS compatibility');
    }

    return {
        atsScore,
        missingKeywords: [...new Set([...missingAtsKeywords, ...missingHighImpactKeywords])],
        suggestedKeywords: keywords.high_impact_keywords.slice(0, 10),
        actionVerbs: missingActionVerbs.slice(0, 10),
        improvementAreas: improvementAreas.length > 0
            ? improvementAreas
            : ['Your resume is well-optimized!'],
        strengths: strengths.length > 0
            ? strengths
            : ['Continue refining your resume content.'],
    };
}

// ========================================
// Mock Data Functions (for development/fallback)
// ========================================

function getMockSkillsForRole(role: string): JobMarketData[] {
    return [
        {
            job_id: 'mock_001',
            job_role: role,
            industry: 'Technology',
            required_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
            trending_skills: ['Next.js', 'AI Integration', 'GraphQL', 'Docker'],
            average_salary: 120000,
            salary_min: 90000,
            salary_max: 150000,
            region: 'United States',
            experience_level: 'Mid-Level',
            demand_score: 8.5,
            ats_keywords: ['React', 'Node.js', 'TypeScript', 'AWS', 'CI/CD'],
            job_description: 'Mock job description',
            company_size: 'Enterprise',
            remote_friendly: true,
        },
    ];
}

function getMockTrendingSkills(industry: string): { skill: string; demand_score: number; frequency: number }[] {
    return [
        { skill: 'AI/ML', demand_score: 9.5, frequency: 150 },
        { skill: 'Cloud Computing', demand_score: 9.2, frequency: 200 },
        { skill: 'TypeScript', demand_score: 8.8, frequency: 180 },
        { skill: 'Docker', demand_score: 8.5, frequency: 140 },
        { skill: 'Kubernetes', demand_score: 8.3, frequency: 120 },
    ];
}

function getMockResumeKeywords(role: string): ResumeKeywords {
    return {
        keyword_id: 'mock_kw_001',
        role,
        industry: 'Technology',
        high_impact_keywords: ['Full Stack Development', 'Cloud Architecture', 'System Design'],
        ats_keywords: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
        soft_skills: ['Problem Solving', 'Team Collaboration', 'Communication'],
        technical_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        action_verbs: ['Developed', 'Architected', 'Implemented', 'Optimized', 'Led'],
        certifications: ['AWS Certified Developer', 'Azure Fundamentals'],
        keyword_weight: 0.95,
        effectiveness_score: 9.1,
    };
}

function getMockCareerInsights(domain: string): CareerInsights {
    return {
        insight_id: 'mock_ins_001',
        domain,
        future_opportunities: ['Cloud Architect', 'Engineering Manager', 'Technical Lead'],
        certifications: ['AWS Solutions Architect', 'Kubernetes Administrator'],
        demand_score: 8.7,
        growth_rate: 15.5,
        avg_career_progression_years: 3,
        top_companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
        emerging_technologies: ['AI Integration', 'Edge Computing', 'WebAssembly'],
        skill_gap_analysis: 'High demand for cloud and AI skills',
        salary_growth_potential: 25.5,
        job_openings_count: 45000,
        geographic_hotspots: ['San Francisco', 'Seattle', 'New York', 'Austin'],
    };
}
