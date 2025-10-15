'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating the first question for an AI interview.
 *
 * It includes:
 * - generateFirstInterviewQuestion - A function that orchestrates the question generation.
 */

import { ai } from '@/ai/genkit';
import {
  AiInterviewerInputSchema,
  AiInterviewerOutputSchema,
  type AiInterviewerInput,
  type AiInterviewerOutput,
} from '@/ai/schemas/ai-interviewer';

export async function generateFirstInterviewQuestion(
  input: AiInterviewerInput
): Promise<AiInterviewerOutput> {
  return aiInterviewerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiInterviewerPrompt',
  input: { schema: AiInterviewerInputSchema },
  output: { schema: AiInterviewerOutputSchema },
  prompt: `
    You are a professional and friendly HR interviewer for a company called CareerLens.
    Your task is to start a mock interview with a candidate.

    The candidate's profile is as follows:
    - Name: {{userProfile.name}}
    - Stated Career Goal: {{userProfile.careerGoals}}
    - Key Skills: {{#each userProfile.skills}}{{this.name}}, {{/each}}
    - Experience: {{#each userProfile.experience}}{{this.role}} at {{this.company}}, {{/each}}
    - Education: {{#each userProfile.education}}{{this.degree}} in {{this.field}}, {{/each}}

    The interview type is: '{{interviewType}}'.

    Based on all this information, your goal is to generate a warm, welcoming opening line, and then ask the first question.
    The question should be a classic opener like "Tell me about yourself" but tailored slightly to their profile. For example, if they are a developer, you might mention their GitHub.

    Return a single JSON object with the key "firstQuestion".
  `,
  model: 'googleai/gemini-2.5-flash-lite',
});

const aiInterviewerFlow = ai.defineFlow(
  {
    name: 'aiInterviewerFlow',
    inputSchema: AiInterviewerInputSchema,
    outputSchema: AiInterviewerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
