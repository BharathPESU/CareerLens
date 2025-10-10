'use server';

/**
 * @fileOverview Generates an ATS-optimized resume from user profile information and a job description.
 *
 * - generateResumeFromJson - A function that orchestrates the resume generation and ATS analysis.
 * - GenerateResumeFromJsonInput - The input type for the function.
 * - GenerateResumeFromJsonOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema now includes manual overrides and an optional job description.
const GenerateResumeFromJsonInputSchema = z.object({
  profile: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    linkedin: z.string().url().optional(),
    github: z.string().url().optional(),
    summary: z.string().optional(),
    experience: z.array(z.object({
        role: z.string(),
        company: z.string(),
        years: z.string(),
        description: z.string().optional(),
    })),
    education: z.array(z.object({
        degree: z.string(),
        field: z.string(),
        institution: z.string().optional(),
        year: z.string(),
    })),
    skills: z.array(z.object({
        name: z.string(),
        proficiency: z.string(),
    })),
  }).describe('The user\'s saved profile data from Firestore.'),
  manual: z.object({
      fullName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      summary: z.string().optional(),
      experience: z.string().optional().describe('Manual entry for experience, can be bullet points or paragraph.'),
      education: z.string().optional().describe('Manual entry for education.'),
      projects: z.string().optional().describe('Manual entry for projects.'),
      skills: z.string().optional().describe('Comma-separated list of skills.'),
  }).describe('Manual overrides or additions from the user.'),
  jobDescription: z.string().optional().describe('The job description to compare against for ATS scoring.'),
});
export type GenerateResumeFromJsonInput = z.infer<typeof GenerateResumeFromJsonInputSchema>;


const GenerateResumeFromJsonOutputSchema = z.object({
  resumeText: z.string().describe('The full, ATS-optimized resume as a formatted string.'),
  atsScore: z.number().describe('The ATS-friendliness score from 0 to 100.'),
  atsExplanation: z.string().describe('A brief explanation of the ATS score.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations to improve the resume.'),
});
export type GenerateResumeFromJsonOutput = z.infer<typeof GenerateResumeFromJsonOutputSchema>;


export async function generateResumeFromJson(input: GenerateResumeFromJsonInput): Promise<GenerateResumeFromJsonOutput> {
  return generateResumeFromJsonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResumeJsonPrompt',
  input: {schema: GenerateResumeFromJsonInputSchema},
  output: {schema: GenerateResumeFromJsonOutputSchema},
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an expert resume writer and ATS (Applicant Tracking System) optimizer. Your task is to create a professional, ATS-friendly resume.

  **Instructions:**

  1.  **Merge Data:** Combine the user's saved \`profile\` data with their \`manual\` input. The manual input should take precedence if there's an overlap.
  2.  **Analyze and Rewrite:**
      *   Rewrite experience and project descriptions into concise, professional bullet points. Start each bullet with a strong action verb.
      *   Focus on quantifiable achievements (e.g., "Increased sales by 20%" or "Reduced server costs by 15%").
      *   Ensure the language is professional and tailored to corporate or tech roles.
  3.  **ATS Optimization:**
      *   If a \`jobDescription\` is provided, analyze it for key skills, technologies, and qualifications.
      *   Integrate these keywords naturally into the generated resume text, especially in the summary and experience sections.
  4.  **Calculate ATS Score:**
      *   Based on the keyword matching, formatting, and overall quality, provide an \`atsScore\` from 0-100. A score of 85+ is good.
      *   Provide a brief \`atsExplanation\` for the score.
  5.  **Provide Recommendations:**
      *   Give a list of actionable \`recommendations\` to improve the resume and its ATS score.

  **User Profile Data:**
  \`\`\`json
  {{{JSON.stringify profile}}}
  \`\`\`

  **User Manual Input:**
  \`\`\`json
  {{{JSON.stringify manual}}}
  \`\`\`
  
  **Target Job Description:**
  \`\`\`
  {{{jobDescription}}}
  \`\`\`

  Generate the complete resume as a formatted string in \`resumeText\` and provide the ATS analysis. The output must be a single, valid JSON object.
  `, 
   config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
  
});

const generateResumeFromJsonFlow = ai.defineFlow(
  {
    name: 'generateResumeFromJsonFlow',
    inputSchema: GenerateResumeFromJsonInputSchema,
    outputSchema: GenerateResumeFromJsonOutputSchema,
  },
  async input => {
    // Add a helper to the input for the prompt template
    const promptInput = {
        ...input,
        JSON,
    };
    const {output} = await prompt(promptInput);
    return output!;
  }
);