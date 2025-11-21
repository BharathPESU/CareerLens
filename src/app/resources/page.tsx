'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Star, Filter, Search, Sparkles, TrendingUp, Award, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  type Resource,
  getAIResourceRecommendations,
  getCuratedResources,
  searchResources,
} from '@/lib/resource-hub-service';

import { getDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import type { EnhancedUserProfile } from '@/lib/types';

export default function ResourceHubPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAI, setLoadingAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveResources, setLiveResources] = useState<Resource[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const providers = [
    'all',
    'NPTEL',
    'Coursera',
    'AWS Educate',
    'Google Cloud Skills Boost',
    'edX',
    'MIT OpenCourseWare',
    'Harvard Online',
    'Microsoft Learn',
    'IBM SkillsBuild',
    'FreeCodeCamp',
    'Khan Academy'
  ];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, aiRecommendations, searchQuery, selectedProvider, selectedLevel]);

  const loadResources = async () => {
    setLoading(true);
    try {
      const curated = getCuratedResources();
      setResources(curated);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to get personalized recommendations',
        variant: 'destructive',
      });
      return;
    }

    setLoadingAI(true);
    try {
      // Fetch user profile from Firestore
      const app = getApp();
      const db = getFirestore(app);
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data() as EnhancedUserProfile;
      const recommendations = await getAIResourceRecommendations(userProfile);
      setAiRecommendations(recommendations);
      toast({
        title: 'Recommendations Ready!',
        description: `Found ${recommendations.length} courses tailored for you`,
      });
    } catch (error: any) {
      console.error('Error getting AI recommendations:', error);
      toast({
        title: 'Recommendation Failed',
        description: error.message || 'Failed to get personalized recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const loadLiveResources = async () => {
    setLoadingLive(true);
    try {
      const toastId = toast({
        title: '🔄 Scraping Courses...',
        description: 'Fetching from 20+ platforms: NPTEL, AWS, GCP, edX, Coursera, MIT OCW, Harvard, and more...',
        duration: 5000,
      });

      // Call the new comprehensive scraping API
      const response = await fetch('/api/courses/scrape?platforms=all&limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to scrape courses');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape courses');
      }

      // Convert to Resource format
      const liveCoursesAsResources: Resource[] = data.courses.map((course: any) => ({
        id: `live_${course.platform.toLowerCase().replace(/\s+/g, '_')}_${course.id}`,
        title: course.title,
        description: course.description,
        url: course.url,
        provider: course.platform,
        duration: course.duration || 'Self-paced',
        category: course.category || 'Technology',
        skills: course.skills || [],
        certificate: true,
        free: course.isFree,
        level: course.difficulty || 'Beginner',
        createdAt: new Date().toISOString(),
        rating: course.rating || 4,
        enrollments: course.enrolled || 0,
        thumbnail: course.thumbnail,
      }));

      setLiveResources(liveCoursesAsResources);

      // Build status message
      const platformStatus = data.platformStatus
        .map((p: any) => `${p.platform}: ${p.status === 'success' ? '✓' : '✗'} (${p.courses})`)
        .join('\n');

      toast({
        title: '✅ Scraping Complete!',
        description: `Found ${data.totalCourses} courses from ${data.totalPlatforms} platforms`,
        duration: 5000,
      });

      console.log('Platform Status:\n', platformStatus);

    } catch (error: any) {
      console.error('Error loading live resources:', error);
      toast({
        title: '❌ Scraping Failed',
        description: error.message || 'Failed to scrape courses from platforms',
        variant: 'destructive',
      });
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    filterResources();
  }, [resources, aiRecommendations, liveResources, selectedProvider, selectedLevel, searchQuery]);

  const filterResources = () => {
    let allResources = [...resources, ...aiRecommendations, ...liveResources];

    // Remove duplicates based on URL
    allResources = Array.from(new Map(allResources.map(r => [r.url, r])).values());

    // Filter by provider
    if (selectedProvider !== 'all') {
      allResources = allResources.filter((r) => r.provider === selectedProvider);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      allResources = allResources.filter((r) => r.level === selectedLevel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      allResources = allResources.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.category.toLowerCase().includes(query)
      );
    }

    setFilteredResources(allResources);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const allResources = [...resources, ...aiRecommendations];
      const results = searchResources(searchQuery, allResources);
      setFilteredResources(results);
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Failed to search resources',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      'NPTEL': 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FF8C42]/10 text-[#FF8C42] border-[#FF6B35]/30',
      'Coursera': 'bg-gradient-to-r from-[#0056D2]/10 to-[#0073E6]/10 text-[#0073E6] border-[#0056D2]/30',
      'AWS Educate': 'bg-gradient-to-r from-[#FF9900]/10 to-[#FFBB00]/10 text-[#FFBB00] border-[#FF9900]/30',
      'Google Cloud Skills Boost': 'bg-gradient-to-r from-[#00FFC6]/10 to-[#00E5B8]/10 text-[#00FFC6] border-[#00FFC6]/30',
      'edX': 'bg-gradient-to-r from-[#A57CFF]/10 to-[#C4A3FF]/10 text-[#A57CFF] border-[#A57CFF]/30',
      'MIT OpenCourseWare': 'bg-gradient-to-r from-[#A31F34]/10 to-[#C41E3A]/10 text-[#C41E3A] border-[#A31F34]/30',
      'Harvard Online': 'bg-gradient-to-r from-[#A51C30]/10 to-[#C90016]/10 text-[#C90016] border-[#A51C30]/30',
      'Microsoft Learn': 'bg-gradient-to-r from-[#00A4EF]/10 to-[#00BCF2]/10 text-[#00BCF2] border-[#00A4EF]/30',
      'IBM SkillsBuild': 'bg-gradient-to-r from-[#0062FF]/10 to-[#0070FF]/10 text-[#0070FF] border-[#0062FF]/30',
      'FreeCodeCamp': 'bg-gradient-to-r from-[#00FFC6]/10 to-[#00E5B8]/10 text-[#00FFC6] border-[#00FFC6]/30',
      'Khan Academy': 'bg-gradient-to-r from-[#14BF96]/10 to-[#14CC9E]/10 text-[#14CC9E] border-[#14BF96]/30',
    };
    return colors[provider] || 'bg-white/10 text-white/75 border-white/[0.16]';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Beginner': 'bg-gradient-to-r from-[#00FFC6]/20 to-[#00E5B8]/20 text-[#00FFC6] border-[#00FFC6]/30',
      'Intermediate': 'bg-gradient-to-r from-[#00E5FF]/20 to-[#00CCEE]/20 text-[#00E5FF] border-[#00E5FF]/30',
      'Advanced': 'bg-gradient-to-r from-[#FF6EC7]/20 to-[#FF85D4]/20 text-[#FF6EC7] border-[#FF6EC7]/30',
    };
    return colors[level] || 'bg-white/10 text-white/75 border-white/[0.16]';
  };

  return (
    <div className="min-h-screen mesh-wave-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#00E5FF] via-[#A57CFF] to-[#00FFC6] bg-clip-text text-transparent flex items-center gap-3 font-headline">
              <BookOpen className="w-10 h-10 text-[#00E5FF]" />
              Free Resource Hub
            </h1>
            <p className="text-white/65 mt-2 text-lg">
              Discover free courses from NPTEL, Coursera, AWS, GCP & more
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadAIRecommendations}
              disabled={loadingAI || !user}
              className="glass-btn gradient-glow group"
            >
              <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
              {loadingAI ? 'Getting Recommendations...' : 'AI Recommendations'}
            </Button>
            <Button
              onClick={loadLiveResources}
              disabled={loadingLive}
              className="glass-btn bg-gradient-to-r from-[#00E5FF] to-[#00FFC6] text-black font-semibold hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all"
            >
              {loadingLive ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Load Live Resources
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* AI Recommendations Banner */}
        {aiRecommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-[#A57CFF]/30 hover:border-[#A57CFF]/60 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A57CFF]" />
                  AI Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/75 mb-4">
                  Based on your profile and goals, we found {aiRecommendations.length} courses perfect for you!
                </p>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm text-[#00FFC6]">
                    AI-powered recommendations using your skills and career goals
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Live Resources Banner */}
        {liveResources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-[#00FFC6]/30 hover:border-[#00FFC6]/60 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#00FFC6]" />
                  Live Resources from Web
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/75 mb-4">
                  Scraped {liveResources.length} fresh courses from 20+ platforms: NPTEL, AWS, GCP, edX, Coursera, MIT OCW, Harvard, Microsoft Learn, IBM, FreeCodeCamp, Khan Academy, and more!
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00FFC6]" />
                  <span className="text-sm text-[#00FFC6]">
                    Real-time data updated just now
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm text-white/65">Search</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      type="text"
                      placeholder="Search courses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 glass-card border-white/[0.16] focus:border-[#00E5FF] text-white"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="glass-btn bg-gradient-to-r from-[#00E5FF] to-[#A57CFF] text-white hover:shadow-neon-cyan"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* Provider Filter */}
              <div className="space-y-2">
                <label className="text-sm text-white/65">Provider</label>
                <div className="flex flex-wrap gap-2">
                  {providers.map((provider) => (
                    <Button
                      key={provider}
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProvider(provider)}
                      className={`text-xs transition-all ${selectedProvider === provider
                        ? 'bg-gradient-to-r from-[#00E5FF] to-[#A57CFF] text-white border-[#00E5FF]/50 shadow-neon-cyan'
                        : 'glass-card border-white/[0.16] text-white/75 hover:border-[#00E5FF]/50'
                        }`}
                    >
                      {provider === 'all' ? 'All' : provider}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="space-y-2">
                <label className="text-sm text-white/65">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {levels.map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLevel(level)}
                      className={`transition-all ${selectedLevel === level
                        ? 'bg-gradient-to-r from-[#00E5FF] to-[#A57CFF] text-white border-[#00E5FF]/50 shadow-neon-cyan'
                        : 'glass-card border-white/[0.16] text-white/75 hover:border-[#00E5FF]/50'
                        }`}
                    >
                      {level === 'all' ? 'All Levels' : level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-[#00E5FF] border-t-transparent rounded-full mx-auto"
              />
              <p className="text-white/65 mt-4">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="col-span-full">
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Resources Found</h3>
                  <p className="text-white/65 mb-4">
                    Try adjusting your filters or get AI recommendations
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedProvider('all');
                      setSelectedLevel('all');
                    }}
                    className="glass-btn bg-gradient-to-r from-[#00E5FF] to-[#A57CFF] text-white"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredResources.map((resource, index) => (
                <motion.div
                  key={resource.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card hover:border-[#00E5FF]/50 transition-all-300 h-full flex flex-col group">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={getProviderColor(resource.provider)}>
                          {resource.provider}
                        </Badge>
                        {resource.isAIRecommended && (
                          <Badge variant="outline" className="bg-gradient-to-r from-[#A57CFF]/10 to-[#00E5FF]/10 text-[#A57CFF] border-[#A57CFF]/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Pick
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-[#00E5FF] transition-colors">
                        {resource.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-white/65 text-sm mb-4 flex-1">
                        {resource.description}
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getLevelColor(resource.level)}>
                            {resource.level}
                          </Badge>
                          <Badge variant="outline" className="glass-card text-white/75 border-white/[0.16]">
                            {resource.category}
                          </Badge>
                          {resource.duration && (
                            <Badge variant="outline" className="glass-card text-white/75 border-white/[0.16]">
                              {resource.duration}
                            </Badge>
                          )}
                        </div>

                        {resource.rating && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < resource.rating!
                                    ? 'fill-[#00FFC6] text-[#00FFC6]'
                                    : 'text-white/20'
                                    }`}
                                />
                              ))}
                            </div>
                            {resource.enrollments && (
                              <span className="text-xs text-white/50">
                                {resource.enrollments.toLocaleString()} enrolled
                              </span>
                            )}
                          </div>
                        )}

                        <Button
                          asChild
                          className="w-full glass-btn bg-gradient-to-r from-[#00E5FF] to-[#A57CFF] text-white hover:shadow-neon-cyan"
                        >
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Course
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
