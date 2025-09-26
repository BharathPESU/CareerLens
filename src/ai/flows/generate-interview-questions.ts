'use server';

/**
 * @fileOverview Generates interview questions (easy, medium, and hard) with model answers for a specific career role.
 *
 * - generateInterviewQuestions - A function that generates interview questions with model answers.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewQuestionsInputSchema = z.object({
  careerRole: z.string().describe('The career role to generate interview questions for.'),
});
export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const InterviewQuestionSchema = z.object({
  question: z.string().describe('The interview question.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the question.'),
  modelAnswer: z.string().describe('A model answer for the question.'),
});

const GenerateInterviewQuestionsOutputSchema = z.object({
  interviewQuestions: z.array(InterviewQuestionSchema).describe('A list of interview questions with model answers.'),
});
export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(
  input: GenerateInterviewQuestionsInput
): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {schema: GenerateInterviewQuestionsOutputSchema},
  prompt: `You are an expert career coach helping candidates prepare for interviews.

  Generate a set of interview questions (easy, medium, and hard) along with model answers tailored to the following career role:

  {{careerRole}}

  The response should be a JSON object containing an array of interview questions, each with a question, difficulty (easy, medium, or hard), and a model answer.
  `,
  model: 'googleai/gemini-1.5-flash',
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
