'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Search, Target, Zap, TrendingUp, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResumeEvaluator } from './resume-evaluator';
import { ResumeGenerator } from './resume-generator';
import { SkillGapAnalysis } from './skill-gap-analysis';
import { ResumeOptimizer } from './resume-optimizer';
import { CareerInsightsDashboard } from './career-insights-dashboard';

export function ResumePage() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl font-bold font-headline text-glow flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              AI-Powered Resume Hub
            </h1>
            <Badge variant="outline" className="border-primary/50 text-primary">
              <Database className="h-3 w-3 mr-1" />
              BigQuery Powered
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Generate professional resumes, analyze with AI, optimize for ATS, and get real-time market insights powered by BigQuery
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${activeTab === 'generate' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                Resume Generator
              </CardTitle>
              <CardDescription className="text-xs">
                Create professional PDFs with AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${activeTab === 'evaluate' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('evaluate')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-5 w-5 text-primary" />
                Resume Evaluator
              </CardTitle>
              <CardDescription className="text-xs">
                Analyze for ATS compatibility
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${activeTab === 'optimizer' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('optimizer')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-yellow-500" />
                Resume Optimizer
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0.5">NEW</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                BigQuery-powered ATS optimization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${activeTab === 'skill-gap' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('skill-gap')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-orange-500" />
                Skill Gap Analysis
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0.5">NEW</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Compare your skills to market needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${activeTab === 'insights' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Career Insights
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0.5">NEW</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Market trends & salary data
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl mx-auto">
            <TabsTrigger value="generate" className="flex items-center gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="evaluate" className="flex items-center gap-1 text-xs">
              <Search className="h-3 w-3" />
              <span className="hidden sm:inline">Evaluate</span>
            </TabsTrigger>
            <TabsTrigger value="optimizer" className="flex items-center gap-1 text-xs">
              <Zap className="h-3 w-3" />
              <span className="hidden sm:inline">Optimize</span>
            </TabsTrigger>
            <TabsTrigger value="skill-gap" className="flex items-center gap-1 text-xs">
              <Target className="h-3 w-3" />
              <span className="hidden sm:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <ResumeGenerator />
          </TabsContent>

          <TabsContent value="evaluate" className="mt-6">
            <ResumeEvaluator />
          </TabsContent>

          <TabsContent value="optimizer" className="mt-6">
            <ResumeOptimizer />
          </TabsContent>

          <TabsContent value="skill-gap" className="mt-6">
            <SkillGapAnalysis />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <CareerInsightsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
