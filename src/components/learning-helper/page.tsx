'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  BrainCircuit, 
  Lightbulb,
  Sparkles,
  Loader2,
  File as FileIcon,
  CheckCircle2,
  XCircle,
  ListTree,
  FileQuestion,
  BookOpen,
  Brain,
  Rocket,
  Award,
  TrendingUp,
  Star,
  Zap,
  Target,
  ExternalLink,
  Download,
  Play,
  Plus,
  Shield,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useAuth, useFirebase } from '@/hooks/use-auth';
import { fetchEnhancedProfile } from '@/lib/enhanced-profile-service';
import {
  generateSkillRecommendations,
  addSkillToLearning,
  type SkillRecommendation,
} from '@/lib/ai-skill-recommender';
import {
  generateProjectRecommendations,
  generateProjectBrief,
  type ProjectRecommendation,
} from '@/lib/ai-project-generator';
import {
  getCertificationRecommendations,
  type Certification,
} from '@/lib/certification-recommender';
import type { EnhancedUserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getLearningHelperOutput } from '@/lib/actions';
import type { LearningOrchestratorOutput, ExamQuestion } from '@/ai/schemas/learning-orchestrator';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

export function LearningHelperPage() {
    const { user } = useAuth();
    const { db } = useFirebase();
    const { toast } = useToast();

    // PDF Analysis State
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [aiOutput, setAiOutput] = useState<LearningOrchestratorOutput | null>(null);

    // AI Career Hub State
    const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
    const [skills, setSkills] = useState<SkillRecommendation[]>([]);
    const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loadingCareerData, setLoadingCareerData] = useState(false);
    const [careerDataLoaded, setCareerDataLoaded] = useState(false);
    const [certFilter, setCertFilter] = useState<'all' | 'free' | 'paid'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

    // Load career data on mount
    useEffect(() => {
        let isMounted = true;
        
        const loadData = async () => {
            // Prevent duplicate loading
            if (!user || !db || !isMounted || careerDataLoaded || loadingCareerData) return;
            
            try {
                setLoadingCareerData(true);
                const userProfile = await fetchEnhancedProfile(db, user.uid);
                
                if (!userProfile || !isMounted) {
                    return;
                }
                
                setProfile(userProfile);

                const [skillRecs, projectRecs, certRecs] = await Promise.all([
                    generateSkillRecommendations(userProfile),
                    generateProjectRecommendations(userProfile, 6),
                    getCertificationRecommendations(
                        (userProfile.skills || []).map(s => s.name),
                        userProfile.title || 'Software Developer'
                    ),
                ]);

                if (isMounted) {
                    setSkills(skillRecs);
                    setProjects(projectRecs);
                    setCertifications(certRecs);
                    setCareerDataLoaded(true);
                }
            } catch (error) {
                console.error('Error loading AI recommendations:', error);
            } finally {
                if (isMounted) {
                    setLoadingCareerData(false);
                }
            }
        };
        
        loadData();
        
        return () => {
            isMounted = false;
        };
    }, [user?.uid, db]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload a valid PDF file.',
            });
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);
        setAiOutput(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const pdfDataUri = reader.result as string;
                const response = await getLearningHelperOutput({ pdfDataUri });

                if (response.success && response.data) {
                    setAiOutput(response.data);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'AI Processing Failed',
                        description: response.error || 'An unknown error occurred.',
                    });
                     handleReset();
                }
                 setIsProcessing(false);
            };
            reader.onerror = (error) => {
                 toast({
                    variant: 'destructive',
                    title: 'File Read Error',
                    description: 'Could not read the selected file.',
                });
                setIsProcessing(false);
                handleReset();
            };
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Something went wrong.',
            });
            setIsProcessing(false);
            handleReset();
        }
    };

    const handleReset = () => {
        setFileName(null);
        setIsProcessing(false);
        setAiOutput(null);
    }

    const handleAddSkill = async (skill: SkillRecommendation) => {
        if (!db || !user) return;

        try {
            await addSkillToLearning(db, user.uid, skill);
            toast({
                title: 'Added to Learning! 🎯',
                description: `${skill.name} added to your learning path`,
            });
        } catch (error) {
            console.error('Error adding skill:', error);
            toast({
                title: 'Error',
                description: 'Failed to add skill',
                variant: 'destructive',
            });
        }
    };

    const handleDownloadProjectBrief = (project: ProjectRecommendation) => {
        const brief = generateProjectBrief(project);
        const blob = new Blob([brief], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.title.replace(/\s+/g, '-')}-brief.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Downloaded! 📄',
            description: 'Project brief downloaded successfully',
        });
    };

    const filteredCertifications = certifications.filter((cert) => {
        if (certFilter === 'free' && !cert.isFree) return false;
        if (certFilter === 'paid' && cert.isFree) return false;
        if (difficultyFilter !== 'all' && cert.difficulty !== difficultyFilter) return false;
        return true;
    });

    return (
        <div className="p-4 md:p-6 space-y-8 min-h-screen">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 font-headline text-glow">
                            <Sparkles className="w-8 h-8 text-primary"/>
                            AI Learning & Career Hub
                        </h1>
                        <p className="text-muted-foreground">Your complete AI-powered learning and career development companion</p>
                    </div>
                    {profile && (
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-sm">
                                <Target className="w-3 h-3 mr-1" />
                                {profile.title}
                            </Badge>
                            <Badge variant="outline" className="text-sm">
                                <Zap className="w-3 h-3 mr-1" />
                                Level {(profile as any).gamification?.level || 1}
                            </Badge>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Career Hub Tabs - Always Visible */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Tabs defaultValue="AI Skills" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto p-2 bg-primary/10 backdrop-blur-xl border border-primary/30">
                        <TabsTrigger value="AI Skills" className="flex items-center gap-2 h-12 data-[state=active]:bg-primary">
                            <Brain className="w-5 h-5"/>
                            <span className="hidden sm:inline">AI Skills</span>
                        </TabsTrigger>
                        <TabsTrigger value="AI Projects" className="flex items-center gap-2 h-12 data-[state=active]:bg-primary">
                            <Rocket className="w-5 h-5"/>
                            <span className="hidden sm:inline">AI Projects</span>
                        </TabsTrigger>
                        <TabsTrigger value="Certifications" className="flex items-center gap-2 h-12 data-[state=active]:bg-primary">
                            <Award className="w-5 h-5"/>
                            <span className="hidden sm:inline">Certifications</span>
                        </TabsTrigger>
                    </TabsList>

                    {loadingCareerData ? (
                        <div className="flex flex-col items-center justify-center text-center p-16 glass-card rounded-2xl mt-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4"/>
                            <h3 className="text-xl font-bold">Loading your career recommendations...</h3>
                            <p className="text-muted-foreground">Analyzing your profile and generating personalized content</p>
                        </div>
                    ) : (
                        <>
                            {/* AI Skills Tab */}
                            <TabsContent value="AI Skills" className="space-y-4 mt-4">
                                <Card className="glass-card p-6">
                                    <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3">
                                        <Brain className="text-primary"/>
                                        🎯 AI-Recommended Skills
                                    </h2>
                                    {skills.length > 0 ? (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {skills.slice(0, 6).map((skill, idx) => (
                                                <SkillCard key={skill.id} skill={skill} onAdd={() => handleAddSkill(skill)} delay={idx * 0.1} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center p-8">
                                            Complete your profile to get AI-powered skill recommendations
                                        </p>
                                    )}
                                </Card>
                            </TabsContent>

                            {/* AI Projects Tab */}
                            <TabsContent value="AI Projects" className="space-y-4 mt-4">
                                <Card className="glass-card p-6">
                                    <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3">
                                        <Rocket className="text-primary"/>
                                        🚀 AI-Generated Projects
                                    </h2>
                                    {projects.length > 0 ? (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {projects.map((project, idx) => (
                                                <ProjectCard key={project.id} project={project} onDownload={() => handleDownloadProjectBrief(project)} delay={idx * 0.1} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center p-8">
                                            Complete your profile to get AI-generated project ideas
                                        </p>
                                    )}
                                </Card>
                            </TabsContent>

                            {/* Certifications Tab */}
                            <TabsContent value="Certifications" className="space-y-4 mt-4">
                                <Card className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                                        <h2 className="text-2xl font-bold font-headline text-glow flex items-center gap-3">
                                            <Award className="text-primary"/>
                                            🏆 Certifications
                                        </h2>
                                        <div className="flex gap-2">
                                            <select
                                                value={certFilter}
                                                onChange={(e) => setCertFilter(e.target.value as any)}
                                                className="px-3 py-1 bg-background border border-primary/30 rounded-lg text-sm"
                                            >
                                                <option value="all">All</option>
                                                <option value="free">Free</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                            <select
                                                value={difficultyFilter}
                                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                                className="px-3 py-1 bg-background border border-primary/30 rounded-lg text-sm"
                                            >
                                                <option value="all">All Levels</option>
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>

                                    {filteredCertifications.length > 0 ? (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredCertifications.slice(0, 9).map((cert, idx) => (
                                                <CertificationCard key={cert.id} cert={cert} delay={idx * 0.05} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-center p-8">
                                            No certifications match your filters
                                        </p>
                                    )}
                                </Card>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </motion.div>

            {/* PDF Upload Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {!fileName ? (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center gap-6 py-16 px-6">
                            <div className="p-6 bg-primary/10 rounded-full border-2 border-dashed border-primary/50 animate-pulse-slow">
                                <UploadCloud className="w-16 h-16 text-primary" strokeWidth={1.5}/>
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold font-headline mb-2">Upload Study Material</h2>
                                <p className="text-muted-foreground">Upload any PDF to get AI-powered summaries, mind maps, and practice questions</p>
                            </div>
                            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-lg h-14 px-8" disabled={isProcessing}>
                                <label htmlFor="file-upload">
                                    {isProcessing ? "Processing..." : "Choose PDF File"}
                                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".pdf" disabled={isProcessing}/>
                                </label>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        <Card className="glass-card">
                            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <FileIcon className="w-6 h-6 text-primary"/>
                                    <span className="font-semibold">{fileName}</span>
                                </div>
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin"/>
                                        <p className="text-sm text-muted-foreground">AI is processing...</p>
                                    </div>
                                ) : (
                                    <Button variant="outline" onClick={handleReset}>Upload New File</Button>
                                )}
                            </CardContent>
                        </Card>

                        {!isProcessing && aiOutput && (
                            <Tabs defaultValue="Quick Points" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2">
                                    <TabsTrigger value="Quick Points" className="flex items-center gap-2 h-12">
                                        <Lightbulb className="w-4 h-4"/>
                                        Quick Points
                                    </TabsTrigger>
                                    <TabsTrigger value="Deep Dive" className="flex items-center gap-2 h-12">
                                        <BookOpen className="w-4 h-4"/>
                                        Deep Dive
                                    </TabsTrigger>
                                    <TabsTrigger value="Mind Map" className="flex items-center gap-2 h-12">
                                        <ListTree className="w-4 h-4"/>
                                        Mind Map
                                    </TabsTrigger>
                                    <TabsTrigger value="Exam Mode" className="flex items-center gap-2 h-12">
                                        <FileQuestion className="w-4 h-4"/>
                                        Exam Mode
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="Quick Points" className="p-6 glass-card rounded-2xl mt-4">
                                    <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3">
                                        <Lightbulb/>Quick Points
                                    </h2>
                                    {aiOutput?.quickPoints ? (
                                        <ul className="space-y-3">
                                            {aiOutput.quickPoints.map((point, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0"/>
                                                    <span className="text-foreground">{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </TabsContent>

                                <TabsContent value="Deep Dive" className="p-6 glass-card rounded-2xl mt-4">
                                    <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3">
                                        <BookOpen/>Deep Dive
                                    </h2>
                                    {aiOutput?.deepDive ? (
                                        <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiOutput.deepDive.replace(/\n/g, '<br />') }} />
                                    ) : null}
                                </TabsContent>

                                <TabsContent value="Mind Map" className="p-6 glass-card rounded-2xl mt-4">
                                    <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3">
                                        <ListTree/>Mind Map
                                    </h2>
                                    {aiOutput?.mindMap?.label ? (
                                        <div className="p-4 bg-background/50 rounded-lg">
                                            <MindMapNode node={aiOutput.mindMap} level={0} />
                                        </div>
                                    ) : null}
                                </TabsContent>

                                <TabsContent value="Exam Mode" className="p-6 glass-card rounded-2xl mt-4">
                                    <h2 className="text-2xl font-bold mb-4 font-headline text-glow flex items-center gap-3">
                                        <FileQuestion/>Exam Mode
                                    </h2>
                                    {aiOutput?.examQuestions ? (
                                        <ExamMode questions={aiOutput.examQuestions} />
                                    ) : null}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

// Skill Card Component
function SkillCard({ skill, onAdd, delay }: { skill: SkillRecommendation; onAdd: () => void; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30 backdrop-blur-xl p-4 h-full">
                <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{skill.icon}</div>
                    <Badge className={
                        skill.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                        skill.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                    }>
                        {skill.difficulty}
                    </Badge>
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-blue-200">{skill.name}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{skill.description}</p>
                
                <div className="space-y-2 mb-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Skill Match</span>
                            <span className="text-blue-300 font-semibold">{skill.skillMatch}%</span>
                        </div>
                        <Progress value={skill.skillMatch} className="h-2" />
                    </div>
                </div>

                <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {skill.estimatedLearningTime}
                    </Badge>
                    {skill.inDemand && (
                        <Badge variant="outline" className="text-xs text-green-400">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            High Demand
                        </Badge>
                    )}
                </div>

                <div className="space-y-2">
                    <Button onClick={onAdd} size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Learning
                    </Button>
                    {skill.learningResources[0] && (
                        <Button asChild size="sm" variant="outline" className="w-full">
                            <a href={skill.learningResources[0].url} target="_blank" rel="noopener noreferrer">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Start Learning
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </a>
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    );
}

// Project Card Component
function ProjectCard({ project, onDownload, delay }: { project: ProjectRecommendation; onDownload: () => void; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-xl p-4 h-full">
                <div className="flex items-start justify-between mb-3">
                    <Badge className={
                        project.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                        project.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                    }>
                        {project.difficulty}
                    </Badge>
                    <Badge className="bg-pink-500/20 text-pink-300">
                        +{project.xpReward} XP
                    </Badge>
                </div>

                <h3 className="text-lg font-bold mb-2 text-purple-200">{project.title}</h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.summary}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                    {project.techStack.slice(0, 4).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                        </Badge>
                    ))}
                    {project.techStack.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                            +{project.techStack.length - 4} more
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                        <div className="text-gray-400">Time</div>
                        <div className="font-semibold">{project.estimatedTime}</div>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                        <div className="text-gray-400">Value</div>
                        <div className="font-semibold">{project.portfolioValue}</div>
                    </div>
                    <div className="text-center p-2 bg-slate-900/50 rounded">
                        <div className="text-gray-400">XP</div>
                        <div className="font-semibold">{project.xpReward}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Button onClick={onDownload} size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                        <Download className="w-4 h-4 mr-2" />
                        Download Brief
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                        <Play className="w-4 h-4 mr-2" />
                        Start Building
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}

// Certification Card Component
function CertificationCard({ cert, delay }: { cert: Certification; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
        >
            <Card className="bg-gradient-to-br from-pink-900/40 to-orange-900/40 border-pink-500/30 backdrop-blur-xl p-4 h-full">
                <div className="flex items-start justify-between mb-3">
                    <Badge className={cert.isFree ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
                        {cert.isFree ? 'FREE' : `$${cert.price}`}
                    </Badge>
                    {cert.isVerified && (
                        <Badge className="bg-blue-500/20 text-blue-300">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                        </Badge>
                    )}
                </div>

                <div className="text-sm font-semibold text-pink-300 mb-2">{cert.provider}</div>
                <h3 className="text-sm font-bold mb-2 text-pink-200 line-clamp-2">{cert.title}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{cert.description}</p>

                <div className="flex items-center gap-3 mb-3 text-xs">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{cert.rating}</span>
                    </div>
                    <div className="text-gray-400">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {cert.duration}
                    </div>
                </div>

                <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Skill Match</span>
                        <span className="text-pink-300 font-semibold">{cert.skillMatch}%</span>
                    </div>
                    <Progress value={cert.skillMatch} className="h-2" />
                </div>

                <Button asChild size="sm" className="w-full bg-gradient-to-r from-pink-600 to-orange-600">
                    <a href={cert.enrollmentUrl} target="_blank" rel="noopener noreferrer">
                        <Award className="w-3 h-3 mr-2" />
                        Enroll Now
                        <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                </Button>
            </Card>
        </motion.div>
    );
}

// Mind Map Node Component
function MindMapNode({ node, level }: { node: NonNullable<LearningOrchestratorOutput['mindMap']>, level: number }) {
    return (
        <div style={{ marginLeft: level * 20 }}>
            <div className="flex items-start gap-2">
                <BrainCircuit className="w-4 h-4 text-primary/80 shrink-0 mt-1"/>
                <span className="font-semibold break-words">{node.label}</span>
            </div>
            {node.children && node.children.length > 0 && (
                <div className="mt-2 space-y-2 border-l-2 border-primary/20 pl-4">
                    {node.children.map((child: any, index: number) => (
                        <MindMapNode key={`${child.id}-${index}`} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// Exam Mode Component
function ExamMode({ questions }: { questions: ExamQuestion[] }) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.answer) {
                correctAnswers++;
            }
        });
        setScore((correctAnswers / questions.length) * 100);
        setSubmitted(true);
    };

    const allAnswered = Object.keys(answers).length === questions.length;

    return (
        <div className="space-y-6">
            {questions.map((q, index) => {
                const isCorrect = submitted && answers[index] === q.answer;
                const isIncorrect = submitted && answers[index] && answers[index] !== q.answer;

                return (
                    <Card key={index} className={`bg-background/50 transition-all ${isCorrect ? 'border-green-500' : ''} ${isIncorrect ? 'border-destructive' : ''}`}>
                        <CardContent className="p-4">
                            <p className="font-semibold mb-3">{index + 1}. {q.question}</p>
                            <RadioGroup 
                                onValueChange={(value) => handleAnswerChange(index, value)}
                                disabled={submitted}
                                value={answers[index]}
                            >
                                {q.options.map((opt, i) => {
                                    const isCorrectOption = submitted && opt === q.answer;
                                    const isSelectedIncorrect = submitted && opt === answers[index] && opt !== q.answer;
                                    return (
                                        <div key={i} className="flex items-center space-x-3">
                                            <RadioGroupItem value={opt} id={`q${index}-opt${i}`} />
                                            <Label 
                                                htmlFor={`q${index}-opt${i}`}
                                                className={`flex-1 ${isCorrectOption ? 'text-green-400' : ''} ${isSelectedIncorrect ? 'text-destructive' : ''}`}
                                            >
                                                {opt}
                                            </Label>
                                            {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                            {isSelectedIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                                        </div>
                                    );
                                })}
                            </RadioGroup>
                            {isIncorrect && (
                                <p className="text-sm text-green-400 mt-3 p-2 bg-green-500/10 rounded-md">
                                    Correct Answer: {q.answer}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {submitted ? (
                <div className="text-center p-6 bg-card rounded-xl">
                    <h3 className="text-2xl font-bold text-glow">Your Score: {score.toFixed(0)}%</h3>
                    <Button onClick={() => { setSubmitted(false); setAnswers({}); setScore(0); }} className="mt-4">
                        Try Again
                    </Button>
                </div>
            ) : (
                <Button onClick={handleSubmit} disabled={!allAnswered} className="w-full h-12 text-lg">
                    Submit Answers
                </Button>
            )}
        </div>
    );
}
