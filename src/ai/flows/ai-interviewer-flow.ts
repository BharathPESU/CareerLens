'use server';
/**
 * @fileOverview This file defines the Genkit flow for a conversational AI interviewer.
 *
 * It includes:
 * - aiInterviewerFollowup - A function that takes the conversation history and generates the next question.
 */

import { ai } from '@/ai/genkit';
import {
  AiInterviewerFlowInputSchema,
  AiInterviewerFlowOutputSchema,
  type AiInterviewerFlowInput,
  type AiInterviewerFlowOutput,
} from '@/ai/schemas/ai-interviewer-flow';

export async function aiInterviewerFollowup(
  input: AiInterviewerFlowInput
): Promise<AiInterviewerFlowOutput> {
  return aiInterviewerConversationFlow(input);
}

const systemPrompt = `You are a friendly and professional HR interviewer for a company called CareerLens. Your name is "Lena".

You are conducting a mock interview with a candidate for a specific role.
Their profile is provided below. Use it to ask relevant questions.
The interview type is: '{{interviewType}}'.
The user's target job role is: '{{jobRole}}'

The entire conversation history is provided in the transcript.
Your task is to generate the NEXT response in the conversation.

- If the transcript is empty, start with a warm, welcoming opening line, and then ask the first question.
- If the user has just answered a question, acknowledge their answer briefly and ask the next relevant question.
- Keep your responses concise and focused on one question at a time.
- Do not number the questions.
- Maintain a positive and encouraging tone.

Return a single JSON object with the key "response".
`;

const aiInterviewerConversationFlow = ai.defineFlow(
  {
    name: 'aiInterviewerConversationFlow',
    inputSchema: AiInterviewerFlowInputSchema,
    outputSchema: AiInterviewerFlowOutputSchema,
  },
  async (input) => {
    const { userProfile, interviewType, jobRole, transcript } = input;

    const llm = ai.getModel('googleai/gemini-2.5-flash-lite');

    const history = transcript.map(item => ({
      role: item.speaker === 'user' ? 'user' : 'model',
      content: [{ text: item.text }],
    }));

    const { output } = await llm.generate({
      system: systemPrompt,
      history,
      prompt: `User Profile: ${JSON.stringify(userProfile)}`,
      output: {
        schema: AiInterviewerFlowOutputSchema,
      }
    });

    return output!;
  }
);
