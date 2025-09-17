'use server';

import { generateCareerRecommendations } from '@/ai/flows/generate-career-recommendations';
import { performSkillGapAnalysis } from '@/ai/flows/perform-skill-gap-analysis';
import { createPersonalizedRoadmap } from '@/ai/flows/create-personalized-roadmap';
import { generateResumeFromJson } from '@/ai/flows/generate-resume-from-json';
import { generateInterviewQuestions } from '@/ai/flows/generate-interview-questions';

import type { GenerateCareerRecommendationsInput } from '@/ai/flows/generate-career-recommendations';
import type { SkillGapAnalysisInput } from '@/ai/flows/perform-skill-gap-analysis';
import type { CreatePersonalizedRoadmapInput } from '@/ai/flows/create-personalized-roadmap';
import type { GenerateResumeFromJsonInput } from '@/ai/flows/generate-resume-from-json';
import type { GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';

export async function getCareerRecommendations(
  input: GenerateCareerRecommendationsInput
) {
  try {
    const result = await generateCareerRecommendations(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate recommendations.' };
  }
}

export async function getSkillGapAnalysis(input: SkillGapAnalysisInput) {
  try {
    const result = await performSkillGapAnalysis(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to perform skill gap analysis.' };
  }
}

export async function getPersonalizedRoadmap(
  input: CreatePersonalizedRoadmapInput
) {
  try {
    const result = await createPersonalizedRoadmap(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to create roadmap.' };
  }
}

export async function getResumeJson(input: GenerateResumeFromJsonInput) {
  try {
    const result = await generateResumeFromJson(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate resume.' };
  }
}

export async function getInterviewQuestions(
  input: GenerateInterviewQuestionsInput
) {
  try {
    const result = await generateInterviewQuestions(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate questions.' };
  }
}
