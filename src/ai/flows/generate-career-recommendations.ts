'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating career recommendations based on user profile and preferences.
 *
 * It includes:
 * - generateCareerRecommendations - A function that orchestrates the career recommendation generation process.
 * - GenerateCareerRecommendationsInput - The input type for the generateCareerRecommendations function.
 * - GenerateCareerRecommendationsOutput - The return type for the generateCareerRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCareerRecommendationsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('A detailed description of the user profile, including education, experience, skills, and interests.'),
  preferences: z
    .string()
    .describe('The user preferences for a job, including desired salary, location, and company culture.'),
});
export type GenerateCareerRecommendationsInput = z.infer<typeof GenerateCareerRecommendationsInputSchema>;

const GenerateCareerRecommendationsOutputSchema = z.object({
  careerRecommendations: z
    .array(z.string())
    .describe('A list of career recommendations based on the user profile and preferences.'),
  reasons: z
    .array(z.string())
    .describe('Reasons for each career recommendation, explaining why it is a good fit for the user.'),
  missingSkills: z
    .array(z.string())
    .describe('A list of skills that the user is missing for each recommended career.'),
  learningPlan: z
    .array(z.string())
    .describe('A personalized learning plan for the user to acquire the missing skills, including a timeline and resources.'),
  resources: z
    .array(z.string())
    .describe('A list of relevant resources for the user to learn more about the recommended careers and acquire the missing skills.'),
});
export type GenerateCareerRecommendationsOutput = z.infer<typeof GenerateCareerRecommendationsOutputSchema>;

export async function generateCareerRecommendations(input: GenerateCareerRecommendationsInput): Promise<GenerateCareerRecommendationsOutput> {
  return generateCareerRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCareerRecommendationsPrompt',
  input: {schema: GenerateCareerRecommendationsInputSchema},
  output: {schema: GenerateCareerRecommendationsOutputSchema},
  prompt: `You are a career advisor, and generate career recommendations for users based on their profile and preferences.

  Based on the user profile and preferences provided, generate a list of career recommendations, reasons for the recommendations, identified missing skills, a personalized learning plan, and relevant resources.

  User Profile: {{{userProfile}}}
  Preferences: {{{preferences}}}
  `,
});

const generateCareerRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateCareerRecommendationsFlow',
    inputSchema: GenerateCareerRecommendationsInputSchema,
    outputSchema: GenerateCareerRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
