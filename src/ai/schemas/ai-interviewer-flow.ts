/**
 * @fileOverview This file defines the Zod schemas and TypeScript types
 * for the stateful, conversational AI Interviewer flow.
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
  jobDescription: z.string().optional().describe('The description of the role the user is interviewing for.'),
  transcript: z
    .array(transcriptItemSchema)
    .describe('The history of the conversation so far.'),
});
export type AiInterviewerFlowInput = z.infer<
  typeof AiInterviewerFlowInputSchema
>;

export const AiInterviewerFlowOutputSchema = z.object({
  privateAnalysis: z
    .string()
    .describe("A brief, private analysis of the user's previous answer. E.g., 'Good use of the STAR method, but the user could have quantified the result more effectively.'"),
  responseText: z
    .string()
    .describe("The text the AI will say out loud. E.g., 'Thanks for sharing that. Could you tell me about a time you had to handle a major disagreement with a colleague?'"),
  questionCategory: z
    .enum(['Behavioral', 'Technical', 'Situational', 'Opening/Closing'])
    .describe("The category of the question being asked."),
});
export type AiInterviewerFlowOutput = z.infer<
  typeof AiInterviewerFlowOutputSchema
>;
