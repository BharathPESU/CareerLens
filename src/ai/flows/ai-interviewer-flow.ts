'use server';
/**
 * @fileOverview This file defines the Genkit flow for a conversational AI interviewer.
 * This is the "brain" of the AI, responsible for generating context-aware responses.
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

const systemPrompt = `You are "Alex", an expert career coach and interviewer for a top tech company. Your persona is professional, encouraging, and insightful. Your goal is to conduct a realistic and helpful mock interview.

You will be given the following context:
- \`userProfile\`: The candidate's profile (experience, skills, goals).
- \`jobDescription\`: The description of the role the user is interviewing for.
- \`conversationHistory\`: A transcript of the interview so far.

Your task is to analyze the user's most recent answer and generate the next turn in the conversation.

**Instructions:**
1.  **Stay in Character:** Always maintain the persona of "Alex".
2.  **Be Context-Aware:** Use the user's profile, job description, and conversation history to ask relevant, probing follow-up questions. Do not ask questions that are already answered in their profile unless you are asking for a deeper explanation.
3.  **Analyze the Answer:** Provide a brief, private analysis of the user's last response. Was it strong? Did it follow the STAR method? Was it confident? This analysis is for the system and will NOT be spoken.
4.  **Generate a Response:** Create a concise, natural-sounding response or question. It should be no more than 2-3 sentences to keep video generation time short.
5.  **Categorize the Question:** Classify your next question as 'Behavioral', 'Technical', 'Situational', or 'Opening/Closing'.

**Output Format:**
You MUST respond with a single, valid JSON object and nothing else. Do not include markdown formatting like \`\`\`json.
`;

const aiInterviewerConversationFlow = ai.defineFlow(
  {
    name: 'aiInterviewerConversationFlow',
    inputSchema: AiInterviewerFlowInputSchema,
    outputSchema: AiInterviewerFlowOutputSchema,
  },
  async (input) => {
    const { userProfile, interviewType, jobRole, transcript, jobDescription } = input;

    const llm = ai.getModel('googleai/gemini-2.5-flash-lite');

    // Create a simplified history for the model prompt
    const history = transcript.map(item => ({
      role: item.speaker === 'user' ? 'user' : 'model',
      content: [{ text: item.text }],
    }));

    // Construct the final prompt for the LLM
    const finalPrompt = `
      User Profile: ${JSON.stringify(userProfile)}
      Job Description: ${jobDescription || 'Not provided.'}
    `;

    const { output } = await llm.generate({
      system: systemPrompt,
      history,
      prompt: finalPrompt,
      output: {
        schema: AiInterviewerFlowOutputSchema,
      }
    });

    return output!;
  }
);
