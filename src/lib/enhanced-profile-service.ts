'use client';

/**
 * Enhanced User Profile Service - Powered by Amazon DynamoDB
 * Replaces Firestore document reads/writes
 */

import { getItem, putItem, TABLES, isDynamoConfigured } from './dynamodb';
import type {
  EnhancedUserProfile,
  Achievement,
  Project,
  DailyGoal,
  WeeklyActivity,
} from './types';

/**
 * Fetch enhanced user profile with all gamification data
 */
export async function fetchEnhancedProfile(
  _db: any,
  userId: string
): Promise<EnhancedUserProfile | null> {
  if (!userId) {
    console.warn('userId not provided to fetchEnhancedProfile');
    return null;
  }

  try {
    const data = await getItem<EnhancedUserProfile>(TABLES.USERS, { userId });

    if (data) {
      return {
        ...data,
        level: data.level || 1,
        currentXP: data.currentXP || 0,
        totalXP: data.totalXP || 0,
        nextLevelXP: data.nextLevelXP || 1000,
        careerStage: data.careerStage || 'Learner',
        streak: data.streak || 0,
        projects: data.projects || [],
        achievements: data.achievements || initializeAchievements(),
        dailyGoals: data.dailyGoals || initializeDailyGoals(),
        weeklyActivity: data.weeklyActivity || initializeWeeklyActivity(),
        certifications: data.certifications || [],
        languages: data.languages || [],
        interests: data.interests || [],
        analytics: data.analytics || initializeAnalytics(),
      };
    }

    // If no existing profile, return a default initialized profile
    return createDefaultProfile(userId);
  } catch (error: any) {
    console.error('[DynamoDB] Error fetching enhanced profile:', error);
    return createDefaultProfile(userId);
  }
}

export const getEnhancedProfile = (userId: string) => fetchEnhancedProfile(null, userId);

/**
 * Save enhanced user profile
 */
export async function saveEnhancedProfile(
  _db: any,
  userId: string,
  profile: Partial<EnhancedUserProfile>
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const existing = await fetchEnhancedProfile(_db, userId);
    const dataToSave = {
      ...(existing || {}),
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
    };

    await putItem(TABLES.USERS, dataToSave);
    console.log('Enhanced profile saved to DynamoDB successfully');
  } catch (error) {
    console.error('[DynamoDB] Error saving enhanced profile:', error);
    throw error;
  }
}

/**
 * Award XP to user and update level
 */
export async function awardXP(
  _db: any,
  userId: string,
  xpAmount: number,
  reason: string
): Promise<{ leveledUp: boolean; newLevel: number }> {
  const profile = await fetchEnhancedProfile(_db, userId);
  if (!profile) throw new Error('Profile not found');

  const newCurrentXP = profile.currentXP + xpAmount;
  const newTotalXP = profile.totalXP + xpAmount;
  let newLevel = profile.level;
  let leveledUp = false;

  // Check if leveled up
  if (newCurrentXP >= profile.nextLevelXP) {
    newLevel += 1;
    leveledUp = true;
    const carryoverXP = newCurrentXP - profile.nextLevelXP;
    const newNextLevelXP = calculateNextLevelXP(newLevel);

    await saveEnhancedProfile(_db, userId, {
      level: newLevel,
      currentXP: carryoverXP,
      totalXP: newTotalXP,
      nextLevelXP: newNextLevelXP,
      careerStage: getCareerStage(newLevel),
    });

    await logActivity(_db, userId, 'level_up', {
      level: newLevel,
      reason,
    });
  } else {
    await saveEnhancedProfile(_db, userId, {
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
    });
  }

  return { leveledUp, newLevel };
}

/**
 * Complete a daily goal
 */
export async function completeDailyGoal(
  _db: any,
  userId: string,
  goalId: string
): Promise<void> {
  const profile = await fetchEnhancedProfile(_db, userId);
  if (!profile) throw new Error('Profile not found');

  const updatedGoals = profile.dailyGoals.map((goal) =>
    goal.id === goalId
      ? { ...goal, completed: true, completedAt: new Date().toISOString() }
      : goal
  );

  const completedGoal = updatedGoals.find((g) => g.id === goalId);
  if (completedGoal) {
    await awardXP(_db, userId, completedGoal.xpReward, `Completed goal: ${completedGoal.text}`);
  }

  await saveEnhancedProfile(_db, userId, {
    dailyGoals: updatedGoals,
  });
}

/**
 * Unlock an achievement
 */
export async function unlockAchievement(
  _db: any,
  userId: string,
  achievementId: string
): Promise<void> {
  const profile = await fetchEnhancedProfile(_db, userId);
  if (!profile) throw new Error('Profile not found');

  const updatedAchievements = profile.achievements.map((achievement) =>
    achievement.id === achievementId
      ? {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        }
      : achievement
  );

  await saveEnhancedProfile(_db, userId, {
    achievements: updatedAchievements,
  });

  await awardXP(_db, userId, 100, `Unlocked achievement: ${achievementId}`);
  await logActivity(_db, userId, 'achievement_unlocked', { achievementId });
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  _db: any,
  userId: string,
  projectId: string,
  status: 'not-started' | 'in-progress' | 'completed'
): Promise<void> {
  const profile = await fetchEnhancedProfile(_db, userId);
  if (!profile) throw new Error('Profile not found');

  const updatedProjects = profile.projects.map((project) => {
    if (project.id === projectId) {
      const updates: any = { ...project, status };
      if (status === 'in-progress' && !project.startedAt) {
        updates.startedAt = new Date().toISOString();
      }
      if (status === 'completed') {
        updates.completedAt = new Date().toISOString();
      }
      return updates;
    }
    return project;
  });

  await saveEnhancedProfile(_db, userId, {
    projects: updatedProjects,
  });

  const completedProject = updatedProjects.find((p) => p.id === projectId);
  if (status === 'completed' && completedProject) {
    await awardXP(
      _db,
      userId,
      completedProject.xpReward,
      `Completed project: ${completedProject.title}`
    );
  }
}

/**
 * Update user streak
 */
export async function updateStreak(_db: any, userId: string): Promise<number> {
  const profile = await fetchEnhancedProfile(_db, userId);
  if (!profile) return 0;

  const today = new Date().toISOString().split('T')[0];
  const lastActivity = profile.lastActivityDate?.split('T')[0];

  let newStreak = profile.streak || 0;

  if (!lastActivity) {
    newStreak = 1;
  } else if (lastActivity === today) {
    return newStreak;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActivity === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
  }

  await saveEnhancedProfile(_db, userId, {
    streak: newStreak,
    lastActivityDate: new Date().toISOString(),
  });

  return newStreak;
}

/**
 * Log user activity in DynamoDB
 */
export async function logActivity(
  _db: any,
  userId: string,
  activityType: string,
  metadata: any
): Promise<void> {
  try {
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await putItem(TABLES.ACTIVITIES, {
      userId,
      activityId,
      type: activityType,
      metadata,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DynamoDB] Error logging activity:', error);
  }
}

/**
 * Calculate analytics based on user data
 */
export async function calculateAnalytics(
  _db: any,
  userId: string
): Promise<void> {
  const profile = await fetchEnhancedProfile(_db, userId);
  if (!profile) return;

  const analytics = {
    totalProjects: profile.projects.length,
    completedProjects: profile.projects.filter((p) => p.status === 'completed').length,
    totalSkills: profile.skills?.length || 0,
    totalInterviews: 0,
    resumeScore: calculateResumeScore(profile),
    jobMatchProbability: calculateJobMatch(profile),
    weeklyHours: profile.weeklyActivity.reduce((sum, day) => sum + day.hours, 0),
    avgProductivity: Math.round(
      profile.weeklyActivity.reduce((sum, day) => sum + day.productivity, 0) /
        (profile.weeklyActivity.length || 1)
    ),
  };

  await saveEnhancedProfile(_db, userId, { analytics });
}

// Helpers
function calculateNextLevelXP(level: number): number {
  return Math.floor(1000 * Math.pow(1.5, level - 1));
}

function getCareerStage(
  level: number
): 'Learner' | 'Explorer' | 'Developer' | 'Specialist' | 'Innovator' | 'Master' {
  if (level <= 1) return 'Learner';
  if (level <= 2) return 'Explorer';
  if (level <= 3) return 'Developer';
  if (level <= 4) return 'Specialist';
  if (level <= 5) return 'Innovator';
  return 'Master';
}

function calculateResumeScore(profile: EnhancedUserProfile): number {
  let score = 0;
  if (profile.name) score += 10;
  if (profile.email) score += 5;
  if (profile.phone) score += 5;
  if (profile.linkedin) score += 5;
  if (profile.github) score += 5;
  if (profile.summary || profile.objective) score += 10;
  const expCount = profile.experienceDetails?.length || profile.experience?.length || 0;
  score += Math.min(expCount * 10, 30);
  const eduCount = profile.educationDetails?.length || profile.education?.length || 0;
  score += Math.min(eduCount * 10, 20);
  const skillCount = profile.skills?.length || 0;
  score += Math.min(skillCount * 2, 10);
  return Math.min(score, 100);
}

function calculateJobMatch(profile: EnhancedUserProfile): number {
  let score = 60;
  const skillCount = profile.skills?.length || 0;
  score += Math.min(skillCount, 20);
  const expCount = profile.experienceDetails?.length || profile.experience?.length || 0;
  score += Math.min(expCount * 5, 20);
  return Math.min(score, 100);
}

function initializeAchievements(): Achievement[] {
  return [
    {
      id: 'ml-beginner',
      name: 'ML Beginner',
      icon: '🧠',
      unlocked: false,
      description: 'Complete your first ML project',
      category: 'learning',
    },
    {
      id: 'resume-pro',
      name: 'Resume Pro',
      icon: '🚀',
      unlocked: false,
      description: 'Achieve 90% resume score',
      category: 'career',
    },
    {
      id: 'three-internships',
      name: '3 Internships',
      icon: '💼',
      unlocked: false,
      description: 'Complete 3 internships',
      category: 'career',
    },
    {
      id: 'code-master',
      name: 'Code Master',
      icon: '⚡',
      unlocked: false,
      progress: 0,
      description: 'Master 10 programming languages',
      category: 'skill',
    },
    {
      id: 'ai-specialist',
      name: 'AI Specialist',
      icon: '🎯',
      unlocked: false,
      progress: 0,
      description: 'Complete 5 AI projects',
      category: 'project',
    },
    {
      id: 'interview-hero',
      name: 'Interview Hero',
      icon: '🏆',
      unlocked: false,
      progress: 0,
      description: 'Complete 10 mock interviews',
      category: 'career',
    },
  ];
}

function initializeDailyGoals(): DailyGoal[] {
  return [
    {
      id: 'update-resume',
      text: 'Update resume headline',
      completed: false,
      xpReward: 50,
      category: 'career',
    },
    {
      id: 'learn-skill',
      text: 'Learn one new skill',
      completed: false,
      xpReward: 100,
      category: 'learning',
    },
    {
      id: 'mock-interview',
      text: 'Complete mock interview',
      completed: false,
      xpReward: 150,
      category: 'career',
    },
  ];
}

function initializeWeeklyActivity(): WeeklyActivity[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();

  return days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (today.getDay() || 7) + index + 1);

    return {
      day,
      date: date.toISOString().split('T')[0],
      hours: 0,
      productivity: 0,
      activities: [],
    };
  });
}

function initializeAnalytics() {
  return {
    totalProjects: 0,
    completedProjects: 0,
    totalSkills: 0,
    totalInterviews: 0,
    resumeScore: 0,
    jobMatchProbability: 0,
    weeklyHours: 0,
    avgProductivity: 0,
  };
}

export function createDefaultProfile(userId: string): EnhancedUserProfile {
  return {
    name: '',
    email: '',
    phone: '',
    bio: '',
    linkedin: '',
    github: '',
    education: [],
    experience: [],
    skills: [],
    careerGoals: '',
    level: 1,
    currentXP: 0,
    totalXP: 0,
    nextLevelXP: 1000,
    careerStage: 'Learner',
    streak: 0,
    projects: [],
    certifications: [],
    languages: [],
    interests: [],
    achievements: initializeAchievements(),
    dailyGoals: initializeDailyGoals(),
    weeklyActivity: initializeWeeklyActivity(),
    analytics: initializeAnalytics(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
