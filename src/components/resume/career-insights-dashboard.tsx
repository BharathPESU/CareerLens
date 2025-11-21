'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Award,
    Briefcase,
    Building2,
    MapPin,
    DollarSign,
    Rocket,
    Target,
    Sparkles,
    Brain,
    AlertCircle,
    CheckCircle2,
    TrendingDown,
    Zap,
    Clock,
    Shield,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CareerInsightsProps {
    domain?: string;
}

interface CareerInsightsData {
    domain: string;

    // Core Metrics
    demand_score: number;
    growth_rate: number;
    salary_growth_potential: number;
    job_openings_count: number;
    avg_career_progression_years: number;

    // Career & Learning
    future_opportunities: string[];
    certifications: string[];
    emerging_technologies: string[];

    // Companies & Locations
    top_companies: string[];
    geographic_hotspots: string[];

    // Analysis
    skill_gap_analysis: string;
    market_outlook: string;
    competitive_advantage: string;

    // Risk Assessment
    automation_risk: 'Low' | 'Medium' | 'High';
    market_saturation: 'Low' | 'Medium' | 'High';

    // Actions
    immediate_actions: Array<{
        action: string;
        priority: 'Critical' | 'High' | 'Medium';
        timeframe: string;
        impact: string;
    }>;
}

export function CareerInsightsDashboard({ domain: initialDomain = '' }: CareerInsightsProps) {
    const [domain, setDomain] = useState(initialDomain);
    const [insights, setInsights] = useState<CareerInsightsData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchInsights = async () => {
        if (!domain) {
            setError('Please enter a domain');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/bigquery/career-insights?domain=${encodeURIComponent(domain)}`);

            if (!response.ok) {
                throw new Error('Failed to fetch career insights');
            }

            const result = await response.json();
            setInsights(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch if initial domain is provided
    useEffect(() => {
        if (initialDomain) {
            handleFetchInsights();
        }
    }, []);

    return (
        <div className="space-y-6">
            {/* Search Section with Gemini AI Branding */}
            <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-background via-background to-purple-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="relative">
                            <Brain className="h-6 w-6 text-purple-600" />
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-20 blur-sm animate-pulse" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                            Gemini AI Career Intelligence
                        </span>
                        <Badge variant="outline" className="ml-auto border-purple-500/50 text-purple-600 text-xs animate-pulse">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI-Powered
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-base">
                        Get real-time career insights powered by Gemini AI and BigQuery market data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g., Full Stack Development, Data Science, DevOps Engineer"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleFetchInsights()}
                            className="text-base"
                        />
                        <Button
                            onClick={handleFetchInsights}
                            disabled={loading || !domain}
                            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90 transition-opacity"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain className="mr-2 h-4 w-4" />
                                    Explore
                                </>
                            )}
                        </Button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2"
                        >
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-purple-500/5 border border-purple-500/20 px-4 py-3 rounded-md"
                        >
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Analyzing with Gemini AI...</p>
                                    <p className="text-xs text-muted-foreground">Fetching market data, analyzing trends, and generating insights</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Insights Display */}
            {insights && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Key Metrics */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Target className="h-4 w-4" />
                                        <span className="text-xs font-medium">Demand Score</span>
                                    </div>
                                    <div className="text-3xl font-bold text-primary">
                                        {insights.demand_score.toFixed(1)}
                                    </div>
                                    <Progress value={insights.demand_score * 10} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-xs font-medium">Growth Rate</span>
                                    </div>
                                    <div className="text-3xl font-bold text-green-500">
                                        +{insights.growth_rate.toFixed(1)}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">Year-over-year</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span className="text-xs font-medium">Salary Growth</span>
                                    </div>
                                    <div className="text-3xl font-bold text-yellow-500">
                                        +{insights.salary_growth_potential.toFixed(1)}%
                                    </div>
                                    <p className="text-xs text-muted-foreground">Potential increase</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="h-4 w-4" />
                                        <span className="text-xs font-medium">Open Positions</span>
                                    </div>
                                    <div className="text-3xl font-bold text-blue-500">
                                        {insights.job_openings_count.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Currently available</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Future Opportunities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-primary" />
                                Future Career Paths
                            </CardTitle>
                            <CardDescription>
                                Potential career progressions from {insights.domain}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-3">
                                {insights.future_opportunities.map((opportunity, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium">{opportunity}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    ⏱️ Average progression time: <strong>{insights.avg_career_progression_years} years</strong>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emerging Technologies */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" />
                                Emerging Technologies
                            </CardTitle>
                            <CardDescription>
                                Stay ahead with these trending technologies
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {insights.emerging_technologies.map((tech) => (
                                    <Badge key={tech} variant="outline" className="border-yellow-500/50 text-yellow-500">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                                <p className="text-sm">{insights.skill_gap_analysis}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-purple-500" />
                                Recommended Certifications
                            </CardTitle>
                            <CardDescription>
                                Boost your credentials with industry-recognized certifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-3">
                                {insights.certifications.map((cert, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/10"
                                    >
                                        <Award className="h-5 w-5 text-purple-500 flex-shrink-0" />
                                        <span className="text-sm font-medium">{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Top Companies */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-500" />
                                    Top Hiring Companies
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {insights.top_companies.map((company, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="font-medium">{company}</span>
                                            <Badge variant="secondary">#{idx + 1}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-green-500" />
                                    Geographic Hotspots
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {insights.geographic_hotspots.map((location, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <MapPin className="h-4 w-4 text-green-500" />
                                            <span className="font-medium">{location}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* NEW: Immediate Actions - AI Recommendations */}
                    {insights.immediate_actions && insights.immediate_actions.length > 0 && (
                        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-green-500" />
                                    Immediate Action Plan
                                </CardTitle>
                                <CardDescription>
                                    AI-recommended next steps to advance your career
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {insights.immediate_actions.map((item, idx) => {
                                        const priorityColors = {
                                            'Critical': 'border-red-500 bg-red-500/5',
                                            'High': 'border-orange-500 bg-orange-500/5',
                                            'Medium': 'border-yellow-500 bg-yellow-500/5'
                                        };
                                        const priorityIcons = {
                                            'Critical': <AlertCircle className="h-4 w-4 text-red-500" />,
                                            'High': <TrendingUp className="h-4 w-4 text-orange-500" />,
                                            'Medium': <Target className="h-4 w-4 text-yellow-500" />
                                        };

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className={`p-4 rounded-lg border-2 ${priorityColors[item.priority]}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5">{priorityIcons[item.priority]}</div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold">{item.action}</h4>
                                                            <Badge variant="outline" className="text-xs">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {item.timeframe}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{item.impact}</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* NEW: Risk Assessment */}
                    {insights.automation_risk && insights.market_saturation && (
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-500" />
                                        Automation Risk
                                    </CardTitle>
                                    <CardDescription>
                                        Likelihood of automation affecting this role
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">
                                                {insights.automation_risk}
                                            </span>
                                            {insights.automation_risk === 'Low' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                            {insights.automation_risk === 'Medium' && <AlertCircle className="h-6 w-6 text-yellow-500" />}
                                            {insights.automation_risk === 'High' && <TrendingDown className="h-6 w-6 text-red-500" />}
                                        </div>
                                        <Progress
                                            value={insights.automation_risk === 'Low' ? 25 : insights.automation_risk === 'Medium' ? 55 : 85}
                                            className="h-2"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {insights.automation_risk === 'Low' && '✅ This role has low automation risk. Skills remain valuable.'}
                                            {insights.automation_risk === 'Medium' && '⚠️ Some tasks may be automated. Stay adaptable.'}
                                            {insights.automation_risk === 'High' && '🔴 High automation risk. Consider upskilling in AI-adjacent areas.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5 text-purple-500" />
                                        Market Saturation
                                    </CardTitle>
                                    <CardDescription>
                                        Competition level in this field
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold">
                                                {insights.market_saturation}
                                            </span>
                                            {insights.market_saturation === 'Low' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                            {insights.market_saturation === 'Medium' && <AlertCircle className="h-6 w-6 text-yellow-500" />}
                                            {insights.market_saturation === 'High' && <TrendingDown className="h-6 w-6 text-red-500" />}
                                        </div>
                                        <Progress
                                            value={insights.market_saturation === 'Low' ? 25 : insights.market_saturation === 'Medium' ? 55 : 85}
                                            className="h-2"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {insights.market_saturation === 'Low' && '✅ Low competition. Great opportunities available.'}
                                            {insights.market_saturation === 'Medium' && '⚠️ Moderate competition. Differentiate yourself.'}
                                            {insights.market_saturation === 'High' && '🔴 High competition. Strong portfolio essential.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* NEW: Market Analysis & Insights */}
                    {(insights.market_outlook || insights.competitive_advantage) && (
                        <div className="grid gap-6">
                            {insights.market_outlook && (
                                <Card className="border-2 border-blue-500/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-blue-500" />
                                            Market Outlook
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{insights.market_outlook}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {insights.competitive_advantage && (
                                <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-background to-purple-500/5">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-purple-500" />
                                            Competitive Advantage
                                        </CardTitle>
                                        <CardDescription>
                                            What gives you an edge in this market
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed font-medium">{insights.competitive_advantage}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}
