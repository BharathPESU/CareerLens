'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Target,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Sparkles,
    Brain,
    Zap,
    Clock,
    Award,
    BookOpen,
    TrendingDown,
    Trophy,
    BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SkillGapAnalysisResult } from '@/ai/flows/analyze-skill-gap-ai';

interface SkillGapAnalysisProps {
    targetRole?: string;
    currentSkills?: string[];
    industry?: string;
    onAnalyze?: (data: SkillGapAnalysisResult) => void;
}

export function SkillGapAnalysis({
    targetRole: initialRole = '',
    currentSkills: initialSkills = [],
    industry: initialIndustry = 'Technology',
    onAnalyze
}: SkillGapAnalysisProps) {
    const [targetRole, setTargetRole] = useState(initialRole);
    const [industry, setIndustry] = useState(initialIndustry);
    const [skillInput, setSkillInput] = useState('');
    const [currentSkills, setCurrentSkills] = useState<string[]>(initialSkills);
    const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddSkill = () => {
        if (skillInput.trim() && !currentSkills.includes(skillInput.trim())) {
            setCurrentSkills([...currentSkills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setCurrentSkills(currentSkills.filter(s => s !== skill));
    };

    const handleAnalyze = async () => {
        if (!targetRole || currentSkills.length === 0) {
            setError('Please enter a target role and at least one skill');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/bigquery/skill-gap-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    targetRole,
                    currentSkills,
                    industry,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze skill gap');
            }

            const result = await response.json();
            setAnalysis(result.data);
            onAnalyze?.(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        if (percentage >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'immediate': return 'destructive';
            case 'short-term': return 'default';
            case 'long-term': return 'secondary';
            default: return 'outline';
        }
    };

    const getReadinessIcon = (level: string) => {
        switch (level) {
            case 'ready': return <Trophy className="h-5 w-5 text-green-500" />;
            case 'almost-ready': return <CheckCircle2 className="h-5 w-5 text-yellow-500" />;
            case 'needs-preparation': return <AlertCircle className="h-5 w-5 text-orange-500" />;
            default: return <XCircle className="h-5 w-5 text-red-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Gemini AI Branding Input Card */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Gemini AI Skill Gap Analysis
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Sparkles className="h-3 w-3" />
                                    Real-time intelligent analysis with market data
                                </CardDescription>
                            </div>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="hidden md:block"
                        >
                            <Badge variant="outline" className="border-primary/50 bg-primary/10">
                                <Zap className="h-3 w-3 mr-1" />
                                AI-Powered
                            </Badge>
                        </motion.div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Role</label>
                            <Input
                                placeholder="e.g., Full Stack Developer"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Industry</label>
                            <Input
                                placeholder="e.g., Technology"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your Current Skills</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a skill (press Enter)"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <Button onClick={handleAddSkill} variant="secondary">
                                Add
                            </Button>
                        </div>
                        {currentSkills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {currentSkills.map((skill) => (
                                    <Badge
                                        key={skill}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-destructive/20"
                                        onClick={() => handleRemoveSkill(skill)}
                                    >
                                        {skill} <XCircle className="h-3 w-3 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={loading || !targetRole || currentSkills.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="mr-2"
                                >
                                    <Brain className="h-4 w-4" />
                                </motion.div>
                                Gemini AI is analyzing...
                            </>
                        ) : (
                            <>
                                <Brain className="h-4 w-4 mr-2" />
                                Analyze with Gemini AI
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Analysis Results */}
            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Match Score Card */}
                        <Card className="border-2 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200 }}
                                        className={`text-7xl font-bold ${getMatchColor(analysis.matchPercentage)}`}
                                    >
                                        {analysis.matchPercentage}%
                                    </motion.div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-medium">Skill Match Score</p>
                                        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${analysis.matchPercentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className={`h-full ${getProgressColor(analysis.matchPercentage)}`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-4">
                                        {getReadinessIcon(analysis.careerInsights.readinessLevel)}
                                        <span className="font-medium capitalize">
                                            {analysis.careerInsights.readinessLevel.replace('-', ' ')}
                                        </span>
                                        <Badge variant="outline" className="ml-2">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {analysis.careerInsights.estimatedTimeToReady}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tabbed Results */}
                        <Tabs defaultValue="recommendations" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="recommendations">📋 Actions</TabsTrigger>
                                <TabsTrigger value="skills">🎯 Skills</TabsTrigger>
                                <TabsTrigger value="learning">📚 Learn</TabsTrigger>
                                <TabsTrigger value="insights">💡 Insights</TabsTrigger>
                                <TabsTrigger value="market">📊 Market</TabsTrigger>
                            </TabsList>

                            {/* Recommendations Tab */}
                            <TabsContent value="recommendations" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            Prioritized Recommendations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {analysis.recommendations.map((rec, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-4 rounded-lg border bg-card/50"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant={getPriorityColor(rec.priority) as any}>
                                                                {rec.priority}
                                                            </Badge>
                                                            <Badge variant="outline">{rec.category}</Badge>
                                                            <Badge
                                                                variant={rec.impact === 'high' ? 'default' : 'secondary'}
                                                                className="ml-auto"
                                                            >
                                                                {rec.impact} impact
                                                            </Badge>
                                                        </div>
                                                        <p className="font-medium mb-1">{rec.action}</p>
                                                        <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Skills Tab */}
                            <TabsContent value="skills" className="space-y-4 mt-4">
                                {/* Matched Skills */}
                                {analysis.skillBreakdown.matchedSkills.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-green-500">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Your Matched Skills ({analysis.skillBreakdown.matchedSkills.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {analysis.skillBreakdown.matchedSkills.map((skill, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                    <span className="font-medium">{skill.skill}</span>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="border-green-500/50">
                                                            {skill.proficiencyLevel}
                                                        </Badge>
                                                        <Badge
                                                            variant={skill.marketDemand === 'critical' ? 'destructive' : 'secondary'}
                                                        >
                                                            {skill.marketDemand} demand
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Missing Skills */}
                                {analysis.skillBreakdown.missingCriticalSkills.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-red-500">
                                                <XCircle className="h-5 w-5" />
                                                Skills to Acquire ({analysis.skillBreakdown.missingCriticalSkills.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {analysis.skillBreakdown.missingCriticalSkills.map((skill, idx) => (
                                                <div key={idx} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium">{skill.skill}</span>
                                                        <Badge variant={skill.importance === 'must-have' ? 'destructive' : 'secondary'}>
                                                            {skill.importance}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2 text-sm text-muted-foreground">
                                                        <span>Learning: {skill.learnability}</span>
                                                        <span>•</span>
                                                        <span>Time: {skill.timeToLearn}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Emerging Skills */}
                                {analysis.skillBreakdown.emergingSkills.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-blue-500">
                                                <TrendingUp className="h-5 w-5" />
                                                Emerging & Trending Skills ({analysis.skillBreakdown.emergingSkills.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.skillBreakdown.emergingSkills.map((skill, idx) => (
                                                    <Badge
                                                        key={idx}
                                                        variant="outline"
                                                        className="border-blue-500/50 bg-blue-500/10"
                                                    >
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                        {skill.skill} ({skill.trendScore}/10)
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Learning Path Tab */}
                            <TabsContent value="learning" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            Your Personalized Learning Path
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analysis.learningPath.map((phase, idx) => (
                                            <div key={idx} className="border rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Award className="h-5 w-5 text-primary" />
                                                    <h3 className="font-semibold">{phase.phase}</h3>
                                                    <Badge variant="outline" className="ml-auto">
                                                        {phase.duration}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground mb-1">Skills to master:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {phase.skills.map((skill, sidx) => (
                                                                <Badge key={sidx} variant="secondary">{skill}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground mb-1">Resources:</p>
                                                        <ul className="text-sm space-y-1">
                                                            {phase.resources.map((resource, ridx) => (
                                                                <li key={ridx} className="flex items-start gap-2">
                                                                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                                                                    <span>{resource}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Career Insights Tab */}
                            <TabsContent value="insights" className="space-y-4 mt-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2 text-green-500">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Your Strengths
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {analysis.careerInsights.strengthAreas.map((strength, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                                        <Trophy className="h-4 w-4 text-green-500 mt-0.5" />
                                                        <span>{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2 text-orange-500">
                                                <TrendingDown className="h-5 w-5" />
                                                Areas to Improve
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {analysis.careerInsights.weaknessAreas.map((weakness, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                                                        <span>{weakness}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {analysis.careerInsights.competitiveAdvantages.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-blue-500">
                                                <Zap className="h-5 w-5" />
                                                Your Competitive Advantages
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.careerInsights.competitiveAdvantages.map((advantage, idx) => (
                                                    <Badge key={idx} variant="outline" className="border-blue-500/50 bg-blue-500/10">
                                                        <Zap className="h-3 w-3 mr-1" />
                                                        {advantage}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Market Context Tab */}
                            <TabsContent value="market" className="space-y-4 mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            Market Intelligence
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-card border">
                                                <p className="text-sm text-muted-foreground mb-1">Demand Level</p>
                                                <p className="text-lg font-semibold capitalize">
                                                    {analysis.marketContext.demandLevel.replace('-', ' ')}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-card border">
                                                <p className="text-sm text-muted-foreground mb-1">Competition</p>
                                                <p className="text-lg font-semibold capitalize">
                                                    {analysis.marketContext.competitionLevel.replace('-', ' ')}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-card border">
                                                <p className="text-sm text-muted-foreground mb-1">Salary Outlook</p>
                                                <p className="text-lg font-semibold">
                                                    {analysis.marketContext.salaryOutlook}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-lg bg-card border">
                                                <p className="text-sm text-muted-foreground mb-1">Job Openings</p>
                                                <p className="text-lg font-semibold">
                                                    {analysis.marketContext.jobOpenings}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
