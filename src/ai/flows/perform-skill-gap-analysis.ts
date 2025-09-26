'use server';
/**
 * @fileOverview Performs skill gap analysis between user skills and target role requirements.
 *
 * - performSkillGapAnalysis - A function that analyzes the skill gap.
 * - SkillGapAnalysisInput - The input type for the performSkillGapAnalysis function.
 * - SkillGapAnalysisOutput - The return type for the performSkillGapAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SkillGapAnalysisInputSchema = z.object({
  userSkills: z
    .array(z.string())
    .describe('A list of skills possessed by the user.'),
  targetRoleRequirements: z
    .array(z.string())
    .describe('A list of skills required for the target role.'),
});
export type SkillGapAnalysisInput = z.infer<typeof SkillGapAnalysisInputSchema>;

const SkillGapAnalysisOutputSchema = z.object({
  overlappingSkills: z
    .array(z.string())
    .describe('Skills that the user possesses which are also required for the target role.'),
  missingSkills: z
    .array(z.string())
    .describe('Skills that are required for the target role but not possessed by the user.'),
  suggestedLearningOrder: z
    .array(z.string())
    .describe('A suggested order for learning the missing skills, based on dependencies and prerequisites.'),
});
export type SkillGapAnalysisOutput = z.infer<typeof SkillGapAnalysisOutputSchema>;

export async function performSkillGapAnalysis(
  input: SkillGapAnalysisInput
): Promise<SkillGapAnalysisOutput> {
  return performSkillGapAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'skillGapAnalysisPrompt',
  input: {schema: SkillGapAnalysisInputSchema},
  output: {schema: SkillGapAnalysisOutputSchema},
  prompt: `You are an expert career coach specializing in skill gap analysis.

You will use this information to identify the overlapping skills, missing skills, and provide a suggested learning order.

User Skills: {{userSkills}}
Target Role Requirements: {{targetRoleRequirements}}

Given the user's skills and the target role requirements, identify the overlapping skills, missing skills, and a suggested learning order for acquiring the missing skills. Consider dependencies and prerequisites when suggesting the learning order.

Output the overlapping skills, missing skills, and a suggested learning order in JSON format.
`,
  model: 'googleai/gemini-2.5-flash-lite',
});

const performSkillGapAnalysisFlow = ai.defineFlow(
  {
    name: 'performSkillGapAnalysisFlow',
    inputSchema: SkillGapAnalysisInputSchema,
    outputSchema: SkillGapAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
