/**
 * @fileOverview This file defines the Zod schemas and TypeScript types 
 * for the AI Interviewer flow.
 */

import { z } from 'genkit';
import { userProfileSchema } from '@/lib/types';

export const AiInterviewerInputSchema = z.object({
  userProfile: userProfileSchema.describe("The full profile of the user being interviewed."),
  interviewType: z.enum(['technical', 'hr', 'mixed']).describe("The type of interview to be conducted."),
});
export type AiInterviewerInput = z.infer<typeof AiInterviewerInputSchema>;


export const AiInterviewerOutputSchema = z.object({
  firstQuestion: z.string().describe("The welcoming greeting and first question from the AI interviewer."),
});
export type AiInterviewerOutput = z.infer<typeof AiInterviewerOutputSchema>;
