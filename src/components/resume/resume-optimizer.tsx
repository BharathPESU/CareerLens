'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileCheck,
    Sparkles,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Zap,
    Brain,
    Target,
    Award,
    Lightbulb,
    ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ResumeOptimizationResult } from '@/ai/flows/optimize-resume-ai';

interface ResumeOptimizerProps {
    initialRole?: string;
    initialResume?: string;
}

export function ResumeOptimizer({
    initialRole = '',
    initialResume = ''
}: ResumeOptimizerProps) {
    const [targetRole, setTargetRole] = useState(initialRole);
    const [industry, setIndustry] = useState('Technology');
    const [resumeText, setResumeText] = useState(initialResume);
    const [optimization, setOptimization] = useState<ResumeOptimizationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOptimize = async () => {
        if (!targetRole || !resumeText) {
            setError('Please enter a target role and your resume text');
            return;
        }

        if (resumeText.length < 50) {
            setError('Resume text is too short. Please provide a complete resume.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/bigquery/resume-optimization', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: targetRole,
                    resumeText,
                    industry,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to optimize resume');
            }

            const result = await response.json();
            console.log('✅ Optimization result:', result);
            setOptimization(result.data);
        } catch (err) {
            console.error('Optimization error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-yellow-500 to-amber-600';
        if (score >= 40) return 'from-orange-500 to-red-500';
        return 'from-red-500 to-rose-600';
    };

    const getPriorityBadge = (priority: string) => {
        const colors = {
            critical: 'bg-red-500/20 text-red-400 border-red-500/50',
            high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
            medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        };
        return colors[priority as keyof typeof colors] || colors.low;
    };

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-primary animate-pulse" />
                        <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                            Gemini AI Resume Optimizer
                        </span>
                    </CardTitle>
                    <CardDescription>
                        Real-time AI analysis powered by Gemini 2.0 + BigQuery job market data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Target Role *
                            </label>
                            <Input
                                placeholder="e.g., Full Stack Developer"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Industry</label>
                            <Input
                                placeholder="e.g., Technology"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                                className="bg-background/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <FileCheck className="h-4 w-4" />
                            Resume Text *
                        </label>
                        <Textarea
                            placeholder="Paste your complete resume here&#13;&#10;&#13;&#10;Include:&#13;&#10;• Professional summary&#13;&#10;• Work experience&#13;&#10;• Skills & technologies&#13;&#10;• Education&#13;&#10;• Projects & achievements"
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="min-h-[300px] font-mono text-sm bg-background/50 resize-y"
                            rows={15}
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>💡 Tip: More detail = Better analysis</span>
                            <span className={resumeText.length < 50 ? 'text-red-500' : 'text-green-500'}>
                                {resumeText.length} characters
                            </span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2"
                            >
                                <AlertTriangle className="h-4 w-4" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        onClick={handleOptimize}
                        disabled={loading || !targetRole || !resumeText || resumeText.length < 50}
                        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                        size="lg"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Brain className="h-5 w-5 mr-2" />
                                </motion.div>
                                Gemini AI is analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-5 w-5 mr-2" />
                                Optimize with AI
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Optimization Results */}
            <AnimatePresence>
                {optimization && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* ATS Score Cards */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* ATS Score */}
                            <Card className={`border-2 bg-gradient-to-br ${getScoreBgColor(optimization.atsScore)}/10`}>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium">ATS Compatibility</p>
                                                <div className={`text-6xl font-bold ${getScoreColor(optimization.atsScore)}`}>
                                                    {optimization.atsScore}%
                                                </div>
                                            </div>
                                            {optimization.atsScore >= 80 ? (
                                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                                            ) : optimization.atsScore >= 60 ? (
                                                <TrendingUp className="h-16 w-16 text-yellow-500" />
                                            ) : (
                                                <AlertTriangle className="h-16 w-16 text-red-500" />
                                            )}
                                        </div>
                                        <Progress value={optimization.atsScore} className="h-3" />
                                        <p className="text-xs text-muted-foreground">
                                            {optimization.atsScore >= 80
                                                ? '🎉 Excellent! Your resume is highly optimized for ATS systems'
                                                : optimization.atsScore >= 60
                                                    ? '👍 Good, but there\'s room for improvement'
                                                    : '⚠️ Needs significant improvements for ATS compatibility'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Overall Quality */}
                            <Card className="border-2 bg-gradient-to-br from-purple-500/10 to-transparent">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground font-medium">Overall Quality</p>
                                                <div className={`text-6xl font-bold ${getScoreColor(optimization.overallQuality)}`}>
                                                    {optimization.overallQuality}%
                                                </div>
                                            </div>
                                            <Award className="h-16 w-16 text-purple-500" />
                                        </div>
                                        <Progress value={optimization.overallQuality} className="h-3" />
                                        <p className="text-xs text-muted-foreground">
                                            Content quality & market alignment score
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Wins */}
                        {optimization.quickWins && optimization.quickWins.length > 0 && (
                            <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-transparent">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-400">
                                        <Lightbulb className="h-5 w-5" />
                                        Quick Wins - High Impact, Easy Fixes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {optimization.quickWins.map((win, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                                            >
                                                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Zap className="h-4 w-4 text-green-400" />
                                                </div>
                                                <p className="text-sm flex-1">{win}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Detailed Tabs */}
                        <Tabs defaultValue="improvements" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
                                <TabsTrigger value="improvements">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Improve
                                </TabsTrigger>
                                <TabsTrigger value="keywords">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Keywords
                                </TabsTrigger>
                                <TabsTrigger value="action-verbs">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Verbs
                                </TabsTrigger>
                                <TabsTrigger value="skills">
                                    <Target className="h-4 w-4 mr-2" />
                                    Skills
                                </TabsTrigger>
                                <TabsTrigger value="strengths">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Strengths
                                </TabsTrigger>
                            </TabsList>

                            {/* Improvements Tab */}
                            <TabsContent value="improvements" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Prioritized Improvements</CardTitle>
                                        <CardDescription>
                                            Fix these to significantly boost your resume score
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {optimization.improvementAreas.map((area, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="p-4 rounded-lg bg-muted/30 border"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Badge className={getPriorityBadge(area.priority)}>
                                                            {area.priority.toUpperCase()}
                                                        </Badge>
                                                        <div className="flex-1 space-y-2">
                                                            <p className="font-medium text-sm">{area.issue}</p>
                                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                                                <p>{area.recommendation}</p>
                                                            </div>
                                                            {area.example && (
                                                                <div className="mt-2 p-2 bg-primary/5 rounded text-xs font-mono">
                                                                    💡 {area.example}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Keywords Tab */}
                            <TabsContent value="keywords" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Keyword Analysis</CardTitle>
                                        <CardDescription>
                                            Keyword density: {optimization.keywordAnalysis.keywordDensity}%
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Missing Critical Keywords */}
                                        {optimization.keywordAnalysis.missingCriticalKeywords.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Missing Critical Keywords (Add These!)
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {optimization.keywordAnalysis.missingCriticalKeywords.map((keyword) => (
                                                        <Badge key={keyword} variant="destructive" className="cursor-pointer">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Missing Trending Keywords */}
                                        {optimization.keywordAnalysis.missingTrendingKeywords.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Missing Trending Keywords (Recommended)
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {optimization.keywordAnalysis.missingTrendingKeywords.map((keyword) => (
                                                        <Badge
                                                            key={keyword}
                                                            className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
                                                        >
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Present Keywords */}
                                        {optimization.keywordAnalysis.presentKeywords.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Strong Keywords Already Present
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {optimization.keywordAnalysis.presentKeywords.map((keyword) => (
                                                        <Badge
                                                            key={keyword}
                                                            className="bg-green-500/20 text-green-300 border-green-500/50"
                                                        >
                                                            ✓ {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Action Verbs Tab */}
                            <TabsContent value="action-verbs" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Action Verb Analysis</CardTitle>
                                        <CardDescription>
                                            Power words to make your achievements stand out
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Weak to Strong Replacements */}
                                        {optimization.actionVerbAnalysis.weakVerbsToReplace.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-orange-400">Replace Weak Verbs</h4>
                                                <div className="space-y-2">
                                                    {optimization.actionVerbAnalysis.weakVerbsToReplace.map((verb, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                                                        >
                                                            <Badge variant="destructive">{verb.weak}</Badge>
                                                            <ArrowRight className="h-4 w-4" />
                                                            <Badge className="bg-green-500/20 text-green-300">{verb.suggested}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Strong Verbs Used */}
                                        {optimization.actionVerbAnalysis.strongVerbsUsed.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-green-400">Strong Verbs You're Using</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {optimization.actionVerbAnalysis.strongVerbsUsed.map((verb) => (
                                                        <Badge key={verb} className="bg-green-500/20 text-green-300">
                                                            ✓ {verb}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggested Additional Verbs */}
                                        {optimization.actionVerbAnalysis.suggestedVerbs.length > 0 && (
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-semibold text-primary">Additional Power Verbs to Consider</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {optimization.actionVerbAnalysis.suggestedVerbs.map((verb) => (
                                                        <Badge key={verb} variant="outline">{verb}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Skills Gap Tab */}
                            <TabsContent value="skills" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Skill Gap Analysis</CardTitle>
                                        <CardDescription>
                                            Match: {optimization.skillGapInsights.skillMatchPercentage}%
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4">
                                            <div className={`p-4 rounded-lg ${optimization.skillGapInsights.hasAllRequiredSkills
                                                    ? 'bg-green-500/10 border border-green-500/30'
                                                    : 'bg-red-500/10 border border-red-500/30'
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    {optimization.skillGapInsights.hasAllRequiredSkills ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                    ) : (
                                                        <AlertTriangle className="h-5 w-5 text-red-400" />
                                                    )}
                                                    <span className="font-medium">
                                                        {optimization.skillGapInsights.hasAllRequiredSkills
                                                            ? 'All required skills present!'
                                                            : 'Missing required skills'}
                                                    </span>
                                                </div>
                                            </div>

                                            {optimization.skillGapInsights.missingRequiredSkills.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-red-400">Skills to Add:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {optimization.skillGapInsights.missingRequiredSkills.map((skill) => (
                                                            <Badge key={skill} variant="destructive">{skill}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`p-4 rounded-lg ${optimization.skillGapInsights.hasModernSkills
                                                    ? 'bg-blue-500/10 border border-blue-500/30'
                                                    : 'bg-yellow-500/10 border border-yellow-500/30'
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className={`h-5 w-5 ${optimization.skillGapInsights.hasModernSkills
                                                            ? 'text-blue-400'
                                                            : 'text-yellow-400'
                                                        }`} />
                                                    <span className="font-medium">
                                                        {optimization.skillGapInsights.hasModernSkills
                                                            ? 'Modern tech stack evident!'
                                                            : 'Consider adding trending technologies'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Strengths Tab */}
                            <TabsContent value="strengths" className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-400">Resume Strengths</CardTitle>
                                        <CardDescription>
                                            What you're doing excellently
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {optimization.strengths.map((strength, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                                                >
                                                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm flex-1">{strength}</span>
                                                </motion.div>
                                            ))}
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
