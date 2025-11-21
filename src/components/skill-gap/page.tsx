'use client';

import { SkillGapAnalysis } from '@/components/resume/skill-gap-analysis';

/**
 * Standalone Skill Gap Analysis Page
 * Powered by Gemini AI with BigQuery market data
 */
export function SkillGapPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI-Powered Skill Gap Analysis
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover your skill gaps, get personalized learning paths, and become job-ready with Gemini AI
        </p>
      </div>

      <SkillGapAnalysis />
    </div>
  );
}

