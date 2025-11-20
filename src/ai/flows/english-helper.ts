'use server';
/**
 * @fileOverview Genkit flows for English Helper conversational practice
 * Generates starter prompts and follow-up responses with feedback
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input/Output schemas
export const EnglishHelperInputSchema = z.object({
  topic: z.enum(['daily', 'interview', 'travel', 'technical', 'idioms', 'debate']),
  proficiency: z.enum(['basic', 'intermediate', 'advanced']),
  accent: z.enum(['american', 'british', 'australian', 'neutral']),
});

export const EnglishHelperStarterSchema = z.object({
  greeting: z.string().describe('Warm, friendly greeting to start the conversation'),
});

export const EnglishHelperFollowupInputSchema = z.object({
  transcript: z.array(z.object({
    speaker: z.enum(['user', 'ai']),
    text: z.string(),
    timestamp: z.string(),
  })),
  topic: z.string(),
  proficiency: z.string(),
});

export const EnglishHelperFollowupSchema = z.object({
  response: z.string().describe('Natural, conversational response that continues the practice'),
  feedback: z.object({
    grammar: z.object({
      score: z.number().min(0).max(100),
      issues: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    vocabulary: z.object({
      newWords: z.array(z.string()),
      suggestions: z.array(z.string()),
    }),
    pronunciation: z.object({
      score: z.number().min(0).max(100),
      tips: z.array(z.string()),
    }),
    fluency: z.object({
      score: z.number().min(0).max(100),
      observations: z.array(z.string()),
    }),
    encouragement: z.string(),
  }),
  isEndOfSession: z.boolean().describe('True after 5-7 exchanges or when practice goal is met'),
});

export type EnglishHelperInput = z.infer<typeof EnglishHelperInputSchema>;
export type EnglishHelperStarter = z.infer<typeof EnglishHelperStarterSchema>;
export type EnglishHelperFollowupInput = z.infer<typeof EnglishHelperFollowupInputSchema>;
export type EnglishHelperFollowup = z.infer<typeof EnglishHelperFollowupSchema>;

/**
 * Generate initial greeting for English practice session
 */
export async function getEnglishHelperStarter(
  input: EnglishHelperInput
): Promise<EnglishHelperStarter> {
  const proficiencyGuidance = {
    basic: 'Use simple words, short sentences, and speak slowly. Be very encouraging and patient.',
    intermediate: 'Use everyday vocabulary with some variety. Mix simple and moderately complex sentences.',
    advanced: 'Use rich vocabulary, idioms, and complex structures. Challenge them with nuanced topics.',
  };

  const topicPrompts = {
    daily: `Start a friendly conversation about daily life. Ask about their day, hobbies, favorite activities, or routines. Make them feel comfortable sharing personal stories.`,
    interview: `Begin a professional mock interview. Ask about their background, experience, or career goals. Be encouraging but maintain a professional tone.`,
    travel: `Start an exciting conversation about travel and culture. Ask about places they've been, dream destinations, or cultural experiences. Show genuine interest.`,
    technical: `Begin a discussion about technology, problem-solving, or professional topics. Ask about their technical interests, projects, or how they approach challenges.`,
    idioms: `Start by explaining that you'll practice English expressions and idioms together. Begin with a common idiom, explain it, and ask them to use it in a sentence.`,
    debate: `Introduce a thought-provoking topic for discussion. Present both sides briefly and ask for their opinion. Encourage them to explain their reasoning.`,
  };

  const systemPrompt = `You are an AI English Helper - a warm, patient, and encouraging conversation partner.

🎯 YOUR MISSION:
Help this person practice English through natural conversation. Make them feel comfortable, build their confidence, and gently improve their skills.

👤 STUDENT LEVEL: ${input.proficiency.toUpperCase()}
${proficiencyGuidance[input.proficiency]}

💬 TODAY'S FOCUS: ${input.topic.toUpperCase()}
${topicPrompts[input.topic]}

✨ YOUR PERSONALITY:
- Friendly and approachable (like talking to a supportive friend)
- Enthusiastic about their responses (show genuine interest!)
- Patient with mistakes (never judgmental)
- Encouraging and positive (celebrate small wins!)

📝 CONVERSATION STARTERS THAT WORK:
- Open-ended questions (How...? What...? Why...? Tell me about...)
- Personal but not too invasive
- Relatable to their daily life
- Invites them to share stories or opinions

🚫 AVOID:
- Yes/no questions at the start (boring!)
- Complex grammar in your greeting (keep it simple!)
- Being too formal or stiff
- Multiple questions at once (overwhelming!)

Now generate a warm, natural greeting that makes them excited to practice English with you!`;

  const llmResponse = await ai.generate({
    prompt: systemPrompt,
    model: 'googleai/gemini-2.5-flash-lite',
    config: {
      temperature: 1.0, // Higher for more creative, varied greetings
      topP: 0.95,
      topK: 40,
    },
    output: {
      format: 'json',
      schema: EnglishHelperStarterSchema,
    },
  });

  if (!llmResponse.output) {
    throw new Error('Failed to generate starter prompt');
  }

  return llmResponse.output;
}

/**
 * Generate follow-up response with detailed feedback
 */
export async function getEnglishHelperFollowup(
  input: EnglishHelperFollowupInput
): Promise<EnglishHelperFollowup> {
  const conversationHistory = input.transcript
    .map((item) => `${item.speaker === 'ai' ? '🤖 You' : '👤 Student'}: ${item.text}`)
    .join('\n\n');

  const lastUserResponse = input.transcript
    .filter((item) => item.speaker === 'user')
    .pop()?.text || '';

  const exchangeCount = input.transcript.filter((item) => item.speaker === 'ai').length;
  const userResponseCount = input.transcript.filter((item) => item.speaker === 'user').length;

  const proficiencyGuidance: Record<string, string> = {
    basic: 'Be very patient. Focus on basic grammar (verb tenses, articles). Keep vocabulary simple. Praise heavily for any correct usage.',
    intermediate: 'Challenge them with slightly advanced vocabulary. Point out common mistakes. Encourage more complex sentence structures.',
    advanced: 'Introduce idioms, nuanced expressions, and cultural context. Focus on fluency, naturalness, and subtle grammar points.',
  };

  const questionTypes = [
    'Ask them to elaborate with "Can you tell me more about...?"',
    'Ask for their opinion: "What do you think about...?"',
    'Ask them to describe something in detail',
    'Ask them to compare or contrast two things',
    'Ask about their personal experience related to the topic',
    'Challenge them with a "what if" or hypothetical question',
    'Ask them to explain something as if teaching someone',
  ];

  const conversationTips: Record<string, string> = {
    daily: 'Keep it relatable and personal. Ask about feelings, preferences, future plans. Make them tell stories.',
    interview: 'Ask behavioral questions (STAR method). Challenge them to give specific examples. Focus on professional vocabulary.',
    travel: 'Ask about specific moments, cultural differences, favorite experiences. Encourage descriptive language.',
    technical: 'Ask them to explain concepts, discuss problem-solving approaches. Use technical terminology naturally.',
    idioms: 'Teach 1-2 new idioms per exchange. Ask them to create sentences. Explain cultural context.',
    debate: 'Present counterarguments respectfully. Ask them to defend their position. Encourage critical thinking.',
  };

  const systemPrompt = `You are an AI English Helper having a natural conversation with a student.

📊 SESSION PROGRESS: Exchange ${exchangeCount}/6 | Student responses: ${userResponseCount}
${exchangeCount >= 5 ? '⚠️ WRAP UP SOON - Give final encouragement and suggest ending' : '✅ CONTINUE - Keep the conversation flowing'}

📝 CONVERSATION SO FAR:
${conversationHistory}

💬 STUDENT'S LATEST RESPONSE:
"${lastUserResponse}"

👤 PROFICIENCY LEVEL: ${input.proficiency.toUpperCase()}
${proficiencyGuidance[input.proficiency]}

🎯 TOPIC GUIDANCE: ${input.topic.toUpperCase()}
${conversationTips[input.topic]}

🎭 YOUR ROLE AS A CONVERSATION PARTNER:

1️⃣ REACT NATURALLY FIRST:
   - Show genuine interest in what they said
   - Use natural reactions: "Oh wow!", "That's interesting!", "I see!", "Really?"
   - Reference specific details they mentioned
   - Don't jump straight to correction - have a conversation!

2️⃣ CONTINUE THE FLOW:
   - ${questionTypes[exchangeCount % questionTypes.length]}
   - Build on what they just said (don't change topics abruptly)
   - Mix question types (don't repeat the same pattern)
   - If they gave a short answer, encourage elaboration
   - If they're engaged, challenge them more!

3️⃣ ANALYZE THEIR ENGLISH (Behind the scenes for feedback):
   
   GRAMMAR:
   - Check: verb tenses, subject-verb agreement, articles (a/an/the), prepositions, word order
   - If ${input.proficiency === 'basic'}: Focus on basic errors only
   - If ${input.proficiency === 'advanced'}: Note subtle mistakes, awkward phrasing
   - Score 0-100 based on accuracy (be realistic but encouraging)
   
   VOCABULARY:
   - Did they use interesting/appropriate words?
   - Identify new or advanced words they used (for praise!)
   - Note repeated words or missed opportunities for better vocabulary
   - Suggest 2-3 useful alternatives or new words they could learn
   - Score 0-100 based on richness and appropriateness
   
   PRONUNCIATION (Estimated from text):
   - Common mistakes: th sounds, r/l confusion, word stress, silent letters
   - If they wrote "I am going to" → likely pronouncing clearly
   - If they wrote "gonna", "wanna" → using casual speech (note it!)
   - Score 70-95 (can't actually hear them, so be generous)
   
   FLUENCY:
   - Length of response (1-2 words = poor, full sentences = good)
   - Coherence (does it make sense? logical flow?)
   - Hesitation markers in text (um, uh, like, you know)
   - Sentence variety (simple vs complex sentences)
   - Score 0-100 based on natural flow

4️⃣ FRAME FEEDBACK POSITIVELY:
   
   ✅ GOOD: "I love how you said '${lastUserResponse}' - very natural! Just a tiny tip: we usually say..."
   ❌ BAD: "You made a mistake with..."
   
   ✅ GOOD: "Great job using the word '[word]'! That's advanced vocabulary."
   ❌ BAD: "Your vocabulary is limited."
   
   ✅ GOOD: "You're speaking with confidence! Try linking your thoughts like this: [example]"
   ❌ BAD: "Your fluency needs work."

5️⃣ ENCOURAGEMENT FORMULA:
   - Start with something they did RIGHT
   - Add a gentle correction (if needed) as a "tip"
   - End with motivation for next time
   - Example: "You explained that so clearly! One tiny thing - try using 'have been' instead of 'was been'. You're making great progress - keep going!"

6️⃣ CONVERSATION RESPONSE FORMAT:
   - Keep it SHORT (2-3 sentences MAX)
   - Sound like a real person, not a teacher
   - Use contractions (I'm, you're, it's, don't) for naturalness
   - Show enthusiasm with punctuation (!, ?, ...)
   - Don't lecture - CONVERSE!

${exchangeCount >= 5 ? `
🏁 ENDING THE SESSION:
Since this is exchange ${exchangeCount}, prepare to wrap up naturally:
- Thank them for the great practice
- Summarize 1-2 key things they did well
- Give ONE main tip for improvement
- Encourage them to practice more
- Set isEndOfSession: true
` : ''}

Now generate your response!`;

  const llmResponse = await ai.generate({
    prompt: systemPrompt,
    model: 'googleai/gemini-2.5-flash-lite',
    config: {
      temperature: 0.9, // Higher for more natural, varied responses
      topK: 40,
      topP: 0.95,
    },
    output: {
      format: 'json',
      schema: EnglishHelperFollowupSchema,
    },
  });

  if (!llmResponse.output) {
    throw new Error('Failed to generate follow-up response');
  }

  return llmResponse.output;
}
