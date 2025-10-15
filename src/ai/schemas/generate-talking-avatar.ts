import { z } from 'genkit';

export const GenerateTalkingAvatarInputSchema = z.object({
  text: z.string().describe('The text the avatar should speak.'),
  character: z.string().describe('A description of the avatar character.'),
});
export type GenerateTalkingAvatarInput = z.infer<typeof GenerateTalkingAvatarInputSchema>;

export const GenerateTalkingAvatarOutputSchema = z.object({
  videoUrl: z.string().url().describe('The data URL of the generated video.'),
});
export type GenerateTalkingAvatarOutput = z.infer<typeof GenerateTalkingAvatarOutputSchema>;
