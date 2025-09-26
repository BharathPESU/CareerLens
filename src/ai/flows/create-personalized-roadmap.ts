'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized 3-month weekly learning plan
 *  with free and paid resources based on a career recommendation.
 *
 * - createPersonalizedRoadmap - A function that generates a personalized roadmap.
 * - CreatePersonalizedRoadmapInput - The input type for the createPersonalizedRoadmap function.
 * - CreatePersonalizedRoadmapOutput - The return type for the createPersonalizedRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreatePersonalizedRoadmapInputSchema = z.object({
  careerRecommendation: z
    .string()
    .describe('The career recommendation to base the learning plan on.'),
  userSkills: z.array(z.string()).describe('The skills the user already possesses.'),
  missingSkills: z.array(z.string()).describe('The skills the user needs to learn.'),
});
export type CreatePersonalizedRoadmapInput = z.infer<
  typeof CreatePersonalizedRoadmapInputSchema
>;

const CreatePersonalizedRoadmapOutputSchema = z.object({
  learningPlan: z.array(z.object({
    week: z.number().describe('The week number in the 3-month plan.'),
    topic: z.string().describe('The learning topic for the week.'),
    resources: z.array(z.object({
      name: z.string().describe('The name of the resource.'),
      url: z.string().url().describe('The URL of the resource.'),
      type: z.enum(['free', 'paid']).describe('Whether the resource is free or paid.'),
    })).describe('A list of learning resources for the week.'),
  })).describe('A 3-month weekly learning plan with resources.'),
});
export type CreatePersonalizedRoadmapOutput = z.infer<
  typeof CreatePersonalizedRoadmapOutputSchema
>;

export async function createPersonalizedRoadmap(
  input: CreatePersonalizedRoadmapInput
): Promise<CreatePersonalizedRoadmapOutput> {
  return createPersonalizedRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createPersonalizedRoadmapPrompt',
  input: {schema: CreatePersonalizedRoadmapInputSchema},
  output: {schema: CreatePersonalizedRoadmapOutputSchema},
  prompt: `You are a career coach who helps users create personalized learning plans to achieve their career goals.

  Based on the career recommendation: {{{careerRecommendation}}},
  and the user's existing skills: {{#if userSkills}}{{#each userSkills}}- {{{this}}}
{{/each}}{{else}}None{{/if}},
  and the missing skills required for the role: {{#if missingSkills}}{{#each missingSkills}}- {{{this}}}
{{/each}}{{else}}None{{/if}},

  Create a personalized 3-month (12 weeks) weekly learning plan with specific topics and resources (both free and paid) for the user to learn the missing skills and advance their career.
  Provide the name and URL for each resource.

  Ensure that all URLs are valid.

  Format the output as a JSON object conforming to this schema:
  ${JSON.stringify(CreatePersonalizedRoadmapOutputSchema.describe(''))}
  `,
  model: 'googleai/gemini-1.5-flash',
});

const createPersonalizedRoadmapFlow = ai.defineFlow(
  {
    name: 'createPersonalizedRoadmapFlow',
    inputSchema: CreatePersonalizedRoadmapInputSchema,
    outputSchema: CreatePersonalizedRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
