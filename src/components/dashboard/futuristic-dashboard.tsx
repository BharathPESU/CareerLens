'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Trophy, Target, Zap, Brain, Star, Award, 
  TrendingUp, Rocket, Battery, BookOpen, Code,
  Briefcase, Bell, Settings, Mic, Volume2, VolumeX,
  Sun, Moon, Download, FileText, ArrowRight, Play,
  CheckCircle2, Lock, Lightbulb, Activity, BarChart3,
  Users, Globe, Heart, Flame, Coffee, MessageSquare,
  ChevronRight, Plus, Search, Filter, Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function FuturisticDashboard() {
  const [userName] = useState('Balaraj');
  const [currentLevel] = useState(4);
  const [currentXP] = useState(3400);
  const [nextLevelXP] = useState(4500);
  const [resumeScore] = useState(87);
  const [jobMatchProbability] = useState(92);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [aiActive, setAiActive] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [typingComplete, setTypingComplete] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  
  // Typewriter effect for greeting
  useEffect(() => {
    const text = `👋 Welcome back, ${userName}! Ready to boost your AI career today?`;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index <= text.length) {
        setGreeting(text.slice(0, index));
        index++;
      } else {
        setTypingComplete(true);
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [userName]);

  const xpPercentage = (currentXP / nextLevelXP) * 100;
  const xpToNextLevel = nextLevelXP - currentXP;

  const topSkills = [
    { name: 'Machine Learning', confidence: 92, trend: 'up' },
    { name: 'Cloud Architecture', confidence: 85, trend: 'up' },
    { name: 'System Design', confidence: 78, trend: 'stable' },
  ];

  const suggestedProjects = [
    {
      id: 1,
      title: 'AI Salary Predictor App',
      description: 'Build an ML model to predict salaries based on skills and experience',
      difficulty: 'Intermediate',
      xpReward: 500,
      techStack: ['Python', 'Scikit-learn', 'Flask', 'React'],
      estimatedTime: '2 weeks',
    },
    {
      id: 2,
      title: 'Real-time Stock Analyzer',
      description: 'Create a dashboard with live stock predictions using AI',
      difficulty: 'Advanced',
      xpReward: 750,
      techStack: ['Python', 'TensorFlow', 'WebSocket', 'Next.js'],
      estimatedTime: '3 weeks',
    },
    {
      id: 3,
      title: 'Smart Resume Parser',
      description: 'NLP-powered tool to extract and enhance resume content',
      difficulty: 'Beginner',
      xpReward: 300,
      techStack: ['Python', 'spaCy', 'FastAPI'],
      estimatedTime: '1 week',
    },
  ];

  const achievements = [
    { id: 1, name: 'ML Beginner', icon: '🧠', unlocked: true, date: '2024-10-15' },
    { id: 2, name: 'Resume Pro', icon: '🚀', unlocked: true, date: '2024-10-20' },
    { id: 3, name: '3 Internships', icon: '💼', unlocked: true, date: '2024-10-25' },
    { id: 4, name: 'Code Master', icon: '⚡', unlocked: false, progress: 60 },
    { id: 5, name: 'AI Specialist', icon: '🎯', unlocked: false, progress: 40 },
    { id: 6, name: 'Interview Hero', icon: '🏆', unlocked: false, progress: 80 },
  ];

  const careerPath = [
    { level: 1, title: 'Learner', emoji: '🌱', status: 'completed', xp: 1000 },
    { level: 2, title: 'Explorer', emoji: '🔍', status: 'completed', xp: 2000 },
    { level: 3, title: 'Developer', emoji: '💻', status: 'completed', xp: 3000 },
    { level: 4, title: 'Specialist', emoji: '⚙️', status: 'current', xp: 4500 },
    { level: 5, title: 'Innovator', emoji: '🚀', status: 'locked', xp: 6000 },
    { level: 6, title: 'Master', emoji: '👑', status: 'locked', xp: 8000 },
  ];

  const weeklyData = [
    { day: 'Mon', hours: 3.5, productivity: 85 },
    { day: 'Tue', hours: 4.2, productivity: 90 },
    { day: 'Wed', hours: 2.8, productivity: 75 },
    { day: 'Thu', hours: 5.1, productivity: 95 },
    { day: 'Fri', hours: 4.5, productivity: 88 },
    { day: 'Sat', hours: 6.0, productivity: 92 },
    { day: 'Sun', hours: 3.0, productivity: 80 },
  ];

  const dailyGoals = [
    { id: 1, text: 'Update resume headline', completed: true },
    { id: 2, text: 'Learn one new skill', completed: false },
    { id: 3, text: 'Complete mock interview', completed: false },
  ];

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-colors duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900' 
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-slate-200'
    }`}>
      {/* Animated Background with Parallax */}
      <motion.div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ y: backgroundY }}
      >
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${isDarkMode ? 'bg-blue-400/30' : 'bg-blue-600/20'}`}
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

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </motion.div>

      {/* Top Navigation Bar */}
      <motion.nav
        className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
          isDarkMode ? 'bg-slate-900/80 border-blue-500/20' : 'bg-white/80 border-blue-200'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              CareerLens
            </motion.div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400 mr-2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              AI Active
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={isDarkMode ? 'text-blue-300 hover:text-blue-200' : 'text-blue-600 hover:text-blue-700'}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Header with AI Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`${
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-500/30' 
              : 'bg-gradient-to-br from-blue-100/60 to-purple-100/60 border-blue-300'
          } backdrop-blur-xl p-8 relative overflow-hidden`}>
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
            
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <motion.h1 
                  className={`text-4xl md:text-5xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {greeting}
                  {!typingComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      |
                    </motion.span>
                  )}
                </motion.h1>
                
                <AnimatePresence>
                  {typingComplete && (
                    <motion.p
                      className={`text-lg ${isDarkMode ? 'text-blue-200' : 'text-blue-700'} flex items-center gap-2`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Your CareerLens Copilot is analyzing today's insights...
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* AI Status Orb */}
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative">
                  <Brain className="w-10 h-10 text-white" />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* User Progress Overview - Gamified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={`${
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30' 
              : 'bg-gradient-to-br from-purple-100/60 to-pink-100/60 border-purple-300'
          } backdrop-blur-xl p-6 relative overflow-hidden`}>
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Circular XP Ring */}
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className={isDarkMode ? 'text-slate-700' : 'text-slate-300'}
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#xpGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * xpPercentage) / 100 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    style={{ strokeDasharray: 553 }}
                  />
                  <defs>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {currentLevel}
                  </motion.div>
                  <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Level</div>
                  <div className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mt-2`}>
                    {Math.round(xpPercentage)}% to Level {currentLevel + 1}
                  </div>
                </div>

                {/* Pulse Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Progress Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Rising AI/ML Engineer
                    </h3>
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-none">
                      Level {currentLevel}
                    </Badge>
                  </div>
                  <p className={`${isDarkMode ? 'text-purple-200' : 'text-purple-700'}`}>
                    🎯 {xpToNextLevel} XP left to unlock "Advanced ML Developer Badge"
                  </p>
                </div>

                {/* XP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDarkMode ? 'text-purple-300' : 'text-purple-700'}>Experience Points</span>
                    <span className={`font-mono ${isDarkMode ? 'text-pink-300' : 'text-pink-700'}`}>
                      {currentXP} / {nextLevelXP} XP
                    </span>
                  </div>
                  <div className={`relative h-4 rounded-full overflow-hidden ${
                    isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercentage}%` }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className={`${
                    isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
                  } rounded-lg p-3 text-center`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>24</div>
                    <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Projects</div>
                  </div>
                  <div className={`${
                    isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
                  } rounded-lg p-3 text-center`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>15</div>
                    <div className={`text-xs ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`}>Skills</div>
                  </div>
                  <div className={`${
                    isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
                  } rounded-lg p-3 text-center`}>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>45d</div>
                    <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>Streak</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Smart Insights */}
          <div className="space-y-6">
            {/* Resume Score Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ rotateY: 5, scale: 1.02 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30' 
                  : 'bg-gradient-to-br from-cyan-100/60 to-blue-100/60 border-cyan-300'
              } backdrop-blur-xl p-6 cursor-pointer group relative overflow-hidden`}>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, 0],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-cyan-200' : 'text-cyan-800'}`}>
                      AI Resume Score
                    </h3>
                    <FileText className={`w-5 h-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <motion.div
                      className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                    >
                      {resumeScore}%
                    </motion.div>
                  </div>

                  <div className={`text-sm ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'} text-center mb-4`}>
                    <span className="font-semibold">Excellent!</span> Your resume is in the top 15%
                  </div>

                  {/* Hover Tip */}
                  <motion.div
                    className={`${
                      isDarkMode ? 'bg-slate-800/80' : 'bg-white/80'
                    } rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity`}
                  >
                    <p className={`text-xs ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>
                      💡 <strong>Tip:</strong> Replace "Worked on" → "Spearheaded" for more impact
                    </p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            {/* Job Match Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ rotateY: 5, scale: 1.02 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30' 
                  : 'bg-gradient-to-br from-green-100/60 to-emerald-100/60 border-green-300'
              } backdrop-blur-xl p-6 cursor-pointer group`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
                    Job Match Probability
                  </h3>
                  <Target className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>

                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
                  >
                    {jobMatchProbability}%
                  </motion.div>
                </div>

                <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'} text-center`}>
                  High match for <strong>ML Engineer</strong> roles
                </div>
              </Card>
            </motion.div>

            {/* Top Skills Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30' 
                  : 'bg-gradient-to-br from-purple-100/60 to-pink-100/60 border-purple-300'
              } backdrop-blur-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                    Top 3 Skills
                  </h3>
                  <Zap className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>

                <div className="space-y-3">
                  {topSkills.map((skill, idx) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                            {skill.confidence}%
                          </span>
                          <TrendingUp className={`w-3 h-3 ${
                            skill.trend === 'up' ? 'text-green-400' : 'text-yellow-400'
                          }`} />
                        </div>
                      </div>
                      <Progress value={skill.confidence} className="h-2" />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Center Column - Projects & Learning */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30' 
                  : 'bg-gradient-to-br from-blue-100/60 to-indigo-100/60 border-blue-300'
              } backdrop-blur-xl p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    🚀 AI-Suggested Projects
                  </h3>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Project Idea
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {suggestedProjects.slice(0, 2).map((project, idx) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                    >
                      <Card className={`${
                        isDarkMode 
                          ? 'bg-slate-800/50 border-blue-500/20' 
                          : 'bg-white/50 border-blue-300'
                      } p-4 h-full relative overflow-hidden group cursor-pointer`}>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                          transition={{ duration: 0.3 }}
                        />
                        
                        <div className="relative">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className={`${
                              project.difficulty === 'Beginner' 
                                ? 'bg-green-500/20 text-green-300 border-green-500/30'
                                : project.difficulty === 'Intermediate'
                                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                                : 'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}>
                              {project.difficulty}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                              +{project.xpReward} XP
                            </Badge>
                          </div>

                          <h4 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                            {project.title}
                          </h4>
                          <p className={`text-sm mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {project.techStack.map((tech) => (
                              <Badge key={tech} variant="outline" className={`text-xs ${
                                isDarkMode ? 'border-blue-500/30 text-blue-300' : 'border-blue-400 text-blue-700'
                              }`}>
                                {tech}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              ⏱️ {project.estimatedTime}
                            </span>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 group-hover:from-blue-500 group-hover:to-purple-500">
                              <Play className="w-3 h-3 mr-1" />
                              Build Now
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Career Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-500/30' 
                  : 'bg-gradient-to-br from-indigo-100/60 to-purple-100/60 border-indigo-300'
              } backdrop-blur-xl p-6`}>
                <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-indigo-200' : 'text-indigo-800'}`}>
                  🛤️ Career Path Timeline
                </h3>

                <div className="relative">
                  {/* Path Line */}
                  <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div className="relative grid grid-cols-6 gap-2">
                    {careerPath.map((node, idx) => (
                      <motion.div
                        key={node.level}
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + idx * 0.1 }}
                        whileHover={{ y: -10 }}
                      >
                        <div className="relative z-10 flex flex-col items-center">
                          <motion.div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${
                              node.status === 'completed'
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                : node.status === 'current'
                                ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                                : 'bg-gradient-to-br from-slate-600 to-slate-700'
                            } shadow-lg`}
                            animate={
                              node.status === 'current'
                                ? {
                                    boxShadow: [
                                      '0 0 20px rgba(59, 130, 246, 0.5)',
                                      '0 0 40px rgba(59, 130, 246, 0.8)',
                                      '0 0 20px rgba(59, 130, 246, 0.5)',
                                    ],
                                  }
                                : {}
                            }
                            transition={node.status === 'current' ? { duration: 2, repeat: Infinity } : {}}
                          >
                            {node.status === 'locked' ? (
                              <Lock className="w-6 h-6 text-white" />
                            ) : (
                              <span>{node.emoji}</span>
                            )}
                          </motion.div>
                          
                          <div className={`text-xs mt-2 text-center font-medium ${
                            isDarkMode ? 'text-indigo-200' : 'text-indigo-800'
                          }`}>
                            {node.title}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            Lv {node.level}
                          </div>
                        </div>

                        {node.status === 'completed' && (
                          <motion.div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-green-400"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Achievements Wall */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30' 
                  : 'bg-gradient-to-br from-yellow-100/60 to-orange-100/60 border-yellow-300'
              } backdrop-blur-xl p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    🏆 Achievement Wall
                  </h3>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {achievements.map((achievement, idx) => (
                    <motion.div
                      key={achievement.id}
                      className="relative group"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + idx * 0.05 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <div
                        className={`aspect-square rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 p-[2px] ${
                          !achievement.unlocked && 'grayscale opacity-50'
                        }`}
                      >
                        <div className={`w-full h-full ${
                          isDarkMode ? 'bg-slate-900' : 'bg-white'
                        } rounded-lg flex flex-col items-center justify-center p-2`}>
                          <div className="text-3xl mb-1">{achievement.icon}</div>
                          <div className={`text-xs text-center font-medium ${
                            isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
                          }`}>
                            {achievement.name}
                          </div>
                          {!achievement.unlocked && achievement.progress && (
                            <div className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} mt-1`}>
                              {achievement.progress}%
                            </div>
                          )}
                        </div>
                      </div>

                      {achievement.unlocked && (
                        <motion.div
                          className="absolute inset-0 rounded-lg"
                          animate={{
                            boxShadow: [
                              '0 0 20px rgba(250, 204, 21, 0.3)',
                              '0 0 40px rgba(250, 204, 21, 0.6)',
                              '0 0 20px rgba(250, 204, 21, 0.3)',
                            ],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className={`${
                          isDarkMode ? 'bg-slate-900 border-yellow-500/30' : 'bg-white border-yellow-400'
                        } border rounded-lg p-2 text-xs whitespace-nowrap`}>
                          <div className={`font-semibold ${isDarkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                            {achievement.name}
                          </div>
                          {achievement.unlocked && achievement.date && (
                            <div className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                              Unlocked: {achievement.date}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Resume Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-rose-900/40 to-pink-900/40 border-rose-500/30' 
                  : 'bg-gradient-to-br from-rose-100/60 to-pink-100/60 border-rose-300'
              } backdrop-blur-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-rose-200' : 'text-rose-800'}`}>
                    📄 Resume Enhancement Zone
                  </h3>
                  <FileText className={`w-6 h-6 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 h-20">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-bold">Enhance with AI</div>
                      <div className="text-xs opacity-80">Improve impact & clarity</div>
                    </div>
                  </Button>
                  
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-20">
                    <Download className="w-5 h-5 mr-2" />
                    <div className="text-left">
                      <div className="font-bold">Generate PDF</div>
                      <div className="text-xs opacity-80">Download optimized resume</div>
                    </div>
                  </Button>
                </div>

                {/* Inline Suggestion Example */}
                <div className={`mt-4 ${
                  isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
                } rounded-lg p-4`}>
                  <div className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-rose-200' : 'text-rose-800'}`}>
                    💡 AI Suggestion:
                  </div>
                  <div className="space-y-2">
                    <div className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} line-through`}>
                      "Worked on a chatbot project."
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                      "Engineered an AI-driven chatbot improving response accuracy by 32%."
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Analytics Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className={`${
                isDarkMode 
                  ? 'bg-gradient-to-br from-slate-900/40 to-blue-900/40 border-slate-500/30' 
                  : 'bg-gradient-to-br from-slate-100/60 to-blue-100/60 border-slate-300'
              } backdrop-blur-xl p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                    📊 Weekly Analytics
                  </h3>
                  <BarChart3 className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>

                <div className="flex items-end justify-between gap-2 h-40">
                  {weeklyData.map((day, idx) => (
                    <motion.div
                      key={day.day}
                      className="flex-1 flex flex-col items-center gap-2"
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      transition={{ delay: 1.1 + idx * 0.1 }}
                    >
                      <div className="flex-1 w-full flex flex-col justify-end">
                        <motion.div
                          className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg relative overflow-hidden"
                          initial={{ height: 0 }}
                          animate={{ height: `${(day.hours / 6) * 100}%` }}
                          transition={{ delay: 1.1 + idx * 0.1, type: 'spring' }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"
                            animate={{ y: ['-100%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          />
                          <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                            isDarkMode ? 'text-white' : 'text-white'
                          }`}>
                            {day.hours}h
                          </div>
                        </motion.div>
                      </div>
                      <div className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {day.day}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>28.9h</div>
                    <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Total Hours</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>86%</div>
                    <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Avg Productivity</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>+12%</div>
                    <div className={`text-xs ${isDarkMode ? 'text-pink-300' : 'text-pink-700'}`}>vs Last Week</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Daily Goals Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card className={`${
            isDarkMode 
              ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/30' 
              : 'bg-gradient-to-br from-emerald-100/60 to-teal-100/60 border-emerald-300'
          } backdrop-blur-xl p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-800'}`}>
                ✅ Today's Goals
              </h3>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                1/3 Complete
              </Badge>
            </div>

            <div className="space-y-3">
              {dailyGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isDarkMode ? 'bg-slate-800/50' : 'bg-white/50'
                  } ${goal.completed && 'opacity-50'}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + idx * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <motion.div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      goal.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : isDarkMode
                        ? 'border-emerald-400'
                        : 'border-emerald-600'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {goal.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </motion.div>
                  <span className={`flex-1 ${
                    goal.completed 
                      ? 'line-through' 
                      : isDarkMode 
                      ? 'text-emerald-200' 
                      : 'text-emerald-800'
                  }`}>
                    {goal.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* AI Copilot Floating Assistant */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            className="fixed bottom-24 right-8 w-80 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <Card className={`${
              isDarkMode 
                ? 'bg-slate-900/95 border-cyan-500/30' 
                : 'bg-white/95 border-cyan-300'
            } backdrop-blur-xl p-4 shadow-2xl`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        '0 0 20px rgba(34, 211, 238, 0.5)',
                        '0 0 40px rgba(34, 211, 238, 0.8)',
                        '0 0 20px rgba(34, 211, 238, 0.5)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <div className={`font-bold ${isDarkMode ? 'text-cyan-200' : 'text-cyan-800'}`}>
                      AI Copilot
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-green-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      Online
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIChat(false)}
                  className={isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}
                >
                  ×
                </Button>
              </div>

              <div className={`${
                isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100/50'
              } rounded-lg p-3 mb-3`}>
                <p className={`text-sm ${isDarkMode ? 'text-cyan-100' : 'text-cyan-900'}`}>
                  Hi {userName}! I've analyzed your profile. Your ML skills are strong! 
                  I recommend focusing on system design next to reach Tech Lead level. 
                  Want me to create a personalized learning path?
                </p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-sm">
                  Yes, Create Plan
                </Button>
                <Button variant="outline" className="flex-1 text-sm" onClick={() => setShowAIChat(false)}>
                  Later
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={`w-full mt-2 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}
              >
                <Mic className="w-4 h-4 mr-2" />
                Voice Command
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating AI Button */}
      <motion.button
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAIChat(!showAIChat)}
        animate={{
          boxShadow: [
            '0 0 30px rgba(34, 211, 238, 0.5)',
            '0 0 60px rgba(34, 211, 238, 0.8)',
            '0 0 30px rgba(34, 211, 238, 0.5)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Brain className="w-8 h-8 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}
