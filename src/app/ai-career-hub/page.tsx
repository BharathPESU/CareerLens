'use client';
import { useState, useEffect } from 'react';
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
  getFreeCertifications,
  getPaidCertifications,
  type Certification,
} from '@/lib/certification-recommender';
import type { EnhancedUserProfile } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Rocket,
  Award,
  BookOpen,
  Code,
  TrendingUp,
  Star,
  Zap,
  Target,
  CheckCircle2,
  ExternalLink,
  Download,
  Play,
  Plus,
  Filter,
  Loader2,
  Shield,
  Clock,
  BarChart3,
  Flame,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AICareerHubPage() {
  const { user } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [profile, setProfile] = useState<EnhancedUserProfile | null>(null);
  const [skills, setSkills] = useState<SkillRecommendation[]>([]);
  const [projects, setProjects] = useState<ProjectRecommendation[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('skills');
  const [certFilter, setCertFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [user, db]);

  const loadData = async () => {
    if (!user || !db) return;

    try {
      setLoading(true);

      // Load user profile
      const userProfile = await fetchEnhancedProfile(db, user.uid);
      
      if (!userProfile) {
        setLoading(false);
        return;
      }
      
      setProfile(userProfile);

      // Generate recommendations
      const [skillRecs, projectRecs, certRecs] = await Promise.all([
        generateSkillRecommendations(userProfile),
        generateProjectRecommendations(userProfile, 6),
        getCertificationRecommendations(
          (userProfile.skills || []).map(s => s.name),
          userProfile.title || 'Software Developer'
        ),
      ]);

      setSkills(skillRecs);
      setProjects(projectRecs);
      setCertifications(certRecs);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
    // Filter by price
    if (certFilter === 'free' && !cert.isFree) return false;
    if (certFilter === 'paid' && cert.isFree) return false;

    // Filter by difficulty
    if (difficultyFilter !== 'all' && cert.difficulty !== difficultyFilter) return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200 text-lg">Loading your AI career recommendations...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <Card className="p-8 text-center max-w-md bg-slate-900/80 border-blue-500/30">
          <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-white">
            Complete Your Profile First!
          </h2>
          <p className="text-gray-400 mb-6">
            We need your profile information to generate personalized recommendations
          </p>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Link href="/profile/edit">Complete Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        
        {/* Animated Background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 40px rgba(59, 130, 246, 0.5)',
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">AI-Powered Career Engine</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Personalized Career Roadmap
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              AI-generated skills, projects, and certifications tailored specifically for{' '}
              <span className="font-bold text-purple-300">{profile.name}</span> to become a{' '}
              <span className="font-bold text-blue-300">{profile.title || 'top developer'}</span>
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
              {[
                { icon: Sparkles, label: 'Skills Recommended', value: skills.length, color: 'text-blue-400' },
                { icon: Rocket, label: 'Projects to Build', value: projects.length, color: 'text-purple-400' },
                { icon: Award, label: 'Certifications', value: certifications.length, color: 'text-pink-400' },
                { icon: TrendingUp, label: 'Career Readiness', value: `${profile.analytics.resumeScore}%`, color: 'text-green-400' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900/50 backdrop-blur-xl border border-blue-500/20 rounded-xl p-4"
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-slate-900/50 border border-blue-500/20">
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600">
              <Zap className="w-4 h-4 mr-2" />
              Skills to Learn
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-purple-600">
              <Code className="w-4 h-4 mr-2" />
              Project Ideas
            </TabsTrigger>
            <TabsTrigger value="certifications" className="data-[state=active]:bg-pink-600">
              <Award className="w-4 h-4 mr-2" />
              Certifications
            </TabsTrigger>
          </TabsList>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">🎯 Recommended Skills for You</h2>
                  <p className="text-gray-400">
                    AI-analyzed skills to accelerate your path to {profile.title}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, idx) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30 backdrop-blur-xl p-6 h-full relative overflow-hidden group">
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-4xl">{skill.icon}</div>
                          <div className="flex gap-2">
                            <Badge
                              className={
                                skill.difficulty === 'Beginner'
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                  : skill.difficulty === 'Intermediate'
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              }
                            >
                              {skill.difficulty}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              {skill.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Skill Name */}
                        <h3 className="text-xl font-bold mb-2 text-blue-200">{skill.name}</h3>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{skill.description}</p>

                        {/* Metrics */}
                        <div className="space-y-3 mb-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Skill Match</span>
                              <span className="text-blue-300 font-semibold">{skill.skillMatch}%</span>
                            </div>
                            <Progress value={skill.skillMatch} className="h-2" />
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Importance</span>
                              <span className="text-purple-300 font-semibold">{skill.importanceScore}%</span>
                            </div>
                            <Progress value={skill.importanceScore} className="h-2" />
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {skill.estimatedLearningTime}
                          </Badge>
                          {skill.inDemand && (
                            <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              High Demand
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {skill.salaryImpact} Impact
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleAddSkill(skill)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to My Learning
                          </Button>

                          {skill.learningResources[0] && (
                            <Button
                              asChild
                              variant="outline"
                              className="w-full border-blue-500/30"
                            >
                              <a
                                href={skill.learningResources[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Start Learning
                                <ExternalLink className="w-3 h-3 ml-2" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Projects Tab - Continue in next file due to length */}
          <TabsContent value="projects" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">🚀 AI-Generated Project Ideas</h2>
                <p className="text-gray-400">
                  Build these projects to level up your skills and portfolio
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.01, y: -5 }}
                  >
                    <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 backdrop-blur-xl p-6 h-full">
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <Badge
                          className={
                            project.difficulty === 'Beginner'
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : project.difficulty === 'Intermediate'
                              ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                              : 'bg-red-500/20 text-red-300 border-red-500/30'
                          }
                        >
                          {project.difficulty}
                        </Badge>
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                          +{project.xpReward} XP
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold mb-2 text-purple-200">{project.title}</h3>
                      <p className="text-gray-400 mb-4">{project.summary}</p>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.slice(0, 5).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs border-purple-500/30">
                            {tech}
                          </Badge>
                        ))}
                        {project.techStack.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.techStack.length - 5} more
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2 bg-slate-900/50 rounded">
                          <div className="text-xs text-gray-400">Time</div>
                          <div className="text-sm font-semibold">{project.estimatedTime}</div>
                        </div>
                        <div className="text-center p-2 bg-slate-900/50 rounded">
                          <div className="text-xs text-gray-400">Value</div>
                          <div className="text-sm font-semibold">{project.portfolioValue}</div>
                        </div>
                        <div className="text-center p-2 bg-slate-900/50 rounded">
                          <div className="text-xs text-gray-400">Category</div>
                          <div className="text-sm font-semibold text-xs">{project.category}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleDownloadProjectBrief(project)}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Project Brief
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-purple-500/30"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Building
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">🏆 Recommended Certifications</h2>
                  <p className="text-gray-400">
                    Boost your credentials with these industry-recognized certifications
                  </p>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <select
                    value={certFilter}
                    onChange={(e) => setCertFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-blue-500/30 rounded-lg text-sm"
                  >
                    <option value="all">All</option>
                    <option value="free">Free Only</option>
                    <option value="paid">Paid Only</option>
                  </select>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-blue-500/30 rounded-lg text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertifications.slice(0, 12).map((cert, idx) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                  >
                    <Card className="bg-gradient-to-br from-pink-900/40 to-orange-900/40 border-pink-500/30 backdrop-blur-xl p-6 h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <Badge
                          variant="outline"
                          className={
                            cert.isFree
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }
                        >
                          {cert.isFree ? 'FREE' : `$${cert.price}`}
                        </Badge>
                        {cert.isVerified && (
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      {/* Provider Logo / Name */}
                      <div className="text-sm font-semibold text-pink-300 mb-2">{cert.provider}</div>

                      <h3 className="text-lg font-bold mb-2 text-pink-200 line-clamp-2">
                        {cert.title}
                      </h3>

                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{cert.description}</p>

                      {/* Rating & Stats */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span>{cert.rating}</span>
                        </div>
                        <div className="text-gray-400">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {cert.duration}
                        </div>
                      </div>

                      {/* Skill Match */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Skill Match</span>
                          <span className="text-pink-300 font-semibold">{cert.skillMatch}%</span>
                        </div>
                        <Progress value={cert.skillMatch} className="h-2" />
                      </div>

                      {/* Tags */}
                      <div className="flex gap-2 mb-4">
                        <Badge variant="outline" className="text-xs">
                          {cert.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {cert.category}
                        </Badge>
                      </div>

                      {/* Action */}
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500"
                      >
                        <a href={cert.enrollmentUrl} target="_blank" rel="noopener noreferrer">
                          <Award className="w-4 h-4 mr-2" />
                          Enroll Now
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </a>
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
