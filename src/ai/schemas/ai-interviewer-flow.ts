/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the conversational AI Interviewer flow.
 */

import { z } from 'genkit';
import { userProfileSchema } from '@/lib/types';

const transcriptItemSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});

export const AiInterviewerFlowInputSchema = z.object({
  userProfile: userProfileSchema.describe(
    'The full profile of the user being interviewed.'
  ),
  interviewType: z
    .enum(['technical', 'hr', 'mixed'])
    .describe('The type of interview to be conducted.'),
  jobRole: z.string().describe("The user's target job role."),
  transcript: z
    .array(transcriptItemSchema)
    .describe('The history of the conversation so far.'),
});
export type AiInterviewerFlowInput = z.infer<
  typeof AiInterviewerFlowInputSchema
>;

export const AiInterviewerFlowOutputSchema = z.object({
  response: z
    .string()
    .describe("The AI interviewer's next response or question."),
});
export type AiInterviewerFlowOutput = z.infer<
  typeof AiInterviewerFlowOutputSchema
>;
