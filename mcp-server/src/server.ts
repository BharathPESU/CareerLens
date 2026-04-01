#!/usr/bin/env node
/**
 * CareerLens MCP Server
 *
 * Exposes CareerLens AI capabilities as MCP tools so that OpenCode
 * (and any other MCP-compatible client) can invoke them directly.
 *
 * Tools exposed:
 *   - analyze_resume
 *   - analyze_skill_gap
 *   - generate_career_recommendations
 *   - generate_interview_questions
 *   - optimize_resume
 *
 * Prerequisites:
 *   Set the GEMINI_API_KEY environment variable before starting the server.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Gemini client
// ---------------------------------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  process.stderr.write(
    "ERROR: GEMINI_API_KEY environment variable is not set.\n"
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Parse the raw Gemini response as JSON, stripping any markdown code fences
 * the model may have added around the JSON block.
 */
function parseJson<T>(raw: string): T {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  return JSON.parse(stripped) as T;
}

// ---------------------------------------------------------------------------
// MCP server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "careerlens",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// Tool: analyze_resume
// ---------------------------------------------------------------------------

server.tool(
  "analyze_resume",
  "Analyze a resume for ATS compatibility, readability, keyword density, " +
    "impact, and overall quality. Returns scores, strengths, weaknesses, " +
    "keyword analysis, and prioritized improvement suggestions.",
  {
    resumeText: z
      .string()
      .describe("The full plain-text content of the resume to analyze."),
    targetRole: z
      .string()
      .optional()
      .describe("Optional target job role (e.g. 'Senior Software Engineer')."),
    targetIndustry: z
      .string()
      .optional()
      .describe("Optional target industry (e.g. 'Technology')."),
  },
  async ({ resumeText, targetRole, targetIndustry }) => {
    const prompt = `
You are an expert resume analyst and ATS specialist with 15+ years of experience.

Analyze the following resume comprehensively.
${targetRole ? `Target Role: ${targetRole}` : ""}
${targetIndustry ? `Target Industry: ${targetIndustry}` : ""}

Resume:
${resumeText}

Return ONLY a valid JSON object (no markdown fences) with this exact structure:
{
  "scores": {
    "atsScore": <0-100>,
    "readabilityScore": <0-100>,
    "keywordScore": <0-100>,
    "impactScore": <0-100>,
    "structureScore": <0-100>,
    "overallScore": <0-100>
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "keywordAnalysis": {
    "missingKeywords": ["..."],
    "presentKeywords": ["..."],
    "overusedWords": ["..."]
  },
  "suggestions": [
    {
      "type": "critical|important|optional",
      "category": "ats|keywords|formatting|content|structure",
      "title": "...",
      "description": "...",
      "impact": "high|medium|low"
    }
  ]
}
`;
    try {
      const raw = await callGemini(prompt);
      const result = parseJson(raw);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing resume: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: analyze_skill_gap
// ---------------------------------------------------------------------------

server.tool(
  "analyze_skill_gap",
  "Perform an AI-powered skill gap analysis between a candidate's current " +
    "skills and those required for a target role. Returns match percentage, " +
    "missing skills, emerging skills, recommendations, and a learning path.",
  {
    targetRole: z
      .string()
      .describe("The job role the candidate is aiming for."),
    currentSkills: z
      .array(z.string())
      .describe("List of skills the candidate currently has."),
    industry: z
      .string()
      .optional()
      .default("Technology")
      .describe("Target industry (default: Technology)."),
  },
  async ({ targetRole, currentSkills, industry }) => {
    const prompt = `
You are an elite career counselor and skill gap analyst.

Analyze the skill gap for the following:
Target Role: ${targetRole}
Industry: ${industry}
Current Skills: ${currentSkills.join(", ")}

Return ONLY a valid JSON object (no markdown fences) with this exact structure:
{
  "matchPercentage": <0-100>,
  "skillAlignment": "excellent|good|fair|poor",
  "skillBreakdown": {
    "matchedSkills": [
      { "skill": "...", "proficiencyLevel": "expert|advanced|intermediate|beginner", "marketDemand": "critical|high|medium|low" }
    ],
    "missingCriticalSkills": [
      { "skill": "...", "importance": "must-have|highly-recommended|nice-to-have", "learnability": "easy|moderate|challenging", "timeToLearn": "..." }
    ],
    "emergingSkills": [
      { "skill": "...", "trendScore": <0-10>, "futureValue": "very-high|high|medium|low" }
    ]
  },
  "recommendations": [
    { "priority": "immediate|short-term|long-term", "category": "technical|soft-skills|tools|certifications", "action": "...", "rationale": "...", "impact": "high|medium|low" }
  ],
  "careerInsights": {
    "readinessLevel": "ready|almost-ready|needs-preparation|significant-gap",
    "estimatedTimeToReady": "...",
    "strengthAreas": ["..."],
    "weaknessAreas": ["..."],
    "competitiveAdvantages": ["..."]
  },
  "learningPath": [
    { "phase": "...", "duration": "...", "skills": ["..."], "resources": ["..."] }
  ],
  "marketContext": {
    "demandLevel": "very-high|high|moderate|low",
    "competitionLevel": "very-competitive|competitive|moderate|low",
    "salaryOutlook": "...",
    "jobOpenings": "..."
  }
}
`;
    try {
      const raw = await callGemini(prompt);
      const result = parseJson(raw);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing skill gap: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: generate_career_recommendations
// ---------------------------------------------------------------------------

server.tool(
  "generate_career_recommendations",
  "Generate personalized career path recommendations based on a user profile. " +
    "Returns the top 3 career paths with reasons, missing skills, a learning plan, " +
    "and resources.",
  {
    profile: z
      .string()
      .describe(
        "A description of the user's background, current skills, experience, " +
          "interests, and career goals."
      ),
  },
  async ({ profile }) => {
    const prompt = `
You are CareerLens, an AI career advisor.

User Profile: ${profile}

Recommend the top 3 career paths. Return ONLY a valid JSON object (no markdown fences):
{
  "careerRecommendations": [
    {
      "career": "...",
      "reason": "...",
      "missingSkills": "skill1, skill2, ...",
      "learningPlan": "Step 1: ...\nStep 2: ...",
      "resources": "Resource 1\nResource 2"
    }
  ]
}
`;
    try {
      const raw = await callGemini(prompt);
      const result = parseJson(raw);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating career recommendations: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: generate_interview_questions
// ---------------------------------------------------------------------------

server.tool(
  "generate_interview_questions",
  "Generate interview questions (easy, medium, hard) with model answers " +
    "tailored to a specific career role.",
  {
    careerRole: z
      .string()
      .describe(
        "The career role to generate interview questions for " +
          "(e.g. 'Full Stack Developer')."
      ),
    questionCount: z
      .number()
      .int()
      .min(1)
      .max(20)
      .optional()
      .default(9)
      .describe(
        "Number of questions to generate across all difficulty levels (default: 9)."
      ),
  },
  async ({ careerRole, questionCount }) => {
    const prompt = `
You are an expert career coach preparing interview questions.

Generate ${questionCount} interview questions for the role: ${careerRole}
Mix the difficulty levels: easy, medium, and hard.

Return ONLY a valid JSON object (no markdown fences):
{
  "interviewQuestions": [
    {
      "question": "...",
      "difficulty": "easy|medium|hard",
      "modelAnswer": "..."
    }
  ]
}
`;
    try {
      const raw = await callGemini(prompt);
      const result = parseJson(raw);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error generating interview questions: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: optimize_resume
// ---------------------------------------------------------------------------

server.tool(
  "optimize_resume",
  "Optimize a resume for a specific target role and industry. Returns ATS score, " +
    "keyword analysis, action verb feedback, improvement areas, strengths, skill " +
    "gap insights, section-by-section feedback, and quick wins.",
  {
    resumeText: z
      .string()
      .describe("The full plain-text content of the resume to optimize."),
    targetRole: z
      .string()
      .describe("The job role the resume should be optimized for."),
    industry: z
      .string()
      .optional()
      .default("Technology")
      .describe("Target industry (default: Technology)."),
  },
  async ({ resumeText, targetRole, industry }) => {
    const prompt = `
You are an elite resume optimization AI.

Target Role: ${targetRole}
Industry: ${industry}

Resume:
${resumeText}

Analyze this resume and provide actionable optimization advice.
Return ONLY a valid JSON object (no markdown fences):
{
  "atsScore": <0-100>,
  "overallQuality": <0-100>,
  "keywordAnalysis": {
    "missingCriticalKeywords": ["..."],
    "missingTrendingKeywords": ["..."],
    "presentKeywords": ["..."],
    "keywordDensity": <0-100>
  },
  "actionVerbAnalysis": {
    "strongVerbsUsed": ["..."],
    "weakVerbsToReplace": [{ "weak": "...", "suggested": "..." }],
    "suggestedVerbs": ["..."]
  },
  "improvementAreas": [
    { "priority": "critical|high|medium|low", "category": "ats|keywords|impact|formatting|content", "issue": "...", "recommendation": "...", "example": "..." }
  ],
  "strengths": ["..."],
  "skillGapInsights": {
    "hasAllRequiredSkills": true|false,
    "missingRequiredSkills": ["..."],
    "hasModernSkills": true|false,
    "skillMatchPercentage": <0-100>
  },
  "sectionFeedback": [
    { "section": "...", "score": <0-10>, "feedback": "...", "improvements": ["..."] }
  ],
  "quickWins": ["..."]
}
`;
    try {
      const raw = await callGemini(prompt);
      const result = parseJson(raw);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error optimizing resume: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
