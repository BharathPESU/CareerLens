import { z } from 'zod';

const phoneRegex = new RegExp(
  /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
);

export const experienceSchema = z.object({
  role: z.string().min(1, 'Role is required.'),
  company: z.string().min(1, 'Company is required.'),
  years: z.string().min(1, 'Duration is required.'),
  description: z.string().optional(),
});

export const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required.'),
  field: z.string().min(1, 'Field of study is required.'),
  year: z.string().min(4, 'Year must be a valid year.'),
  institution: z.string().optional(),
});

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name cannot be empty.'),
});

export const userProfileSchema = z.object({
  name: z.string().min(2, 'Full name is required.').optional().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Must be a valid phone number.').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less.').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn profile URL.').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub profile URL.').optional().or(z.literal('')),
  
  education: z.array(educationSchema).optional().default([]),
  experience: z.array(experienceSchema).optional().default([]),
  skills: z.array(skillSchema).optional().default([]),
  
  careerGoals: z.string().optional().or(z.literal('')),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Enhanced User Profile with Gamification
export interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  description?: string;
  category?: 'learning' | 'career' | 'skill' | 'project' | 'social';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'not-started' | 'in-progress' | 'completed';
  techStack: string[];
  xpReward: number;
  startedAt?: string;
  completedAt?: string;
  estimatedTime: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface DailyGoal {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  xpReward: number;
  category: 'learning' | 'career' | 'skill' | 'project';
}

export interface WeeklyActivity {
  day: string;
  date: string;
  hours: number;
  productivity: number;
  activities: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  name: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Limited';
}

export interface EnhancedUserProfile extends UserProfile {
  // Basic Info
  email?: string;
  photoURL?: string;
  location?: string;
  title?: string;
  summary?: string;
  objective?: string;
  website?: string;
  twitter?: string;
  
  // Gamification
  level: number;
  currentXP: number;
  totalXP: number;
  nextLevelXP: number;
  careerStage: 'Learner' | 'Explorer' | 'Developer' | 'Specialist' | 'Innovator' | 'Master';
  streak: number;
  lastActivityDate?: string;
  
  // Enhanced Experience
  experienceDetails?: Array<{
    role: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
    technologies?: string[];
  }>;
  
  // Enhanced Education
  educationDetails?: Array<{
    degree: string;
    field: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    honors?: string[];
    coursework?: string[];
  }>;
  
  // Projects
  projects: Project[];
  
  // Certifications
  certifications: Certification[];
  
  // Skills with proficiency
  skillsWithProficiency?: Array<{
    name: string;
    category: 'technical' | 'soft' | 'tool' | 'language' | 'framework';
    proficiency: number; // 0-100
    yearsOfExperience?: number;
  }>;
  
  // Languages
  languages: Language[];
  
  // Interests
  interests: string[];
  
  // Achievements
  achievements: Achievement[];
  
  // Daily Goals
  dailyGoals: DailyGoal[];
  
  // Weekly Activity
  weeklyActivity: WeeklyActivity[];
  
  // Analytics
  analytics: {
    totalProjects: number;
    completedProjects: number;
    totalSkills: number;
    totalInterviews: number;
    resumeScore: number;
    jobMatchProbability: number;
    weeklyHours: number;
    avgProductivity: number;
  };
  
  // Resume Data
  resumeData?: ResumeData;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// Career Graph Types
export interface CareerActivity {
  id: string;
  userId: string;
  type: 'skill_added' | 'course_completed' | 'project_added' | 'experience_added' | 'profile_updated' | 'interview_completed' | 'learning_session';
  timestamp: string | Date;
  metadata: {
    skillName?: string;
    courseName?: string;
    projectName?: string;
    duration?: number; // minutes
    intensity?: number; // 1-10 scale
  };
  impact: number; // 1-10, how much this activity contributes to career progress
}

export interface SkillNode {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'domain' | 'tool' | 'language';
  weight: number; // 0-100, proficiency level
  frequency: number; // how often practiced
  recency: number; // days since last activity
  connections: string[]; // IDs of related skills
}

export interface CareerGraphData {
  userId: string;
  currentRole?: string;
  targetRole?: string;
  skills: SkillNode[];
  activities: CareerActivity[];
  readinessScore: number; // 0-100
  lastUpdated: string | Date;
}

export interface HeatmapDay {
  date: string;
  count: number; // number of activities
  intensity: number; // 0-4 for color scale
  activities: CareerActivity[];
}

export interface CareerRecommendation {
  type: 'skill' | 'course' | 'project' | 'certification';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  provider?: string;
  url?: string;
  relevanceScore: number;
}

// Resume Analysis Types
export interface ResumeAnalysisScores {
  atsScore: number; // 0-100
  readabilityScore: number; // 0-100
  keywordScore: number; // 0-100
  impactScore: number; // 0-100 - based on action verbs
  structureScore: number; // 0-100
  overallScore: number; // 0-100
}

export interface ResumeSuggestion {
  id: string;
  type: 'critical' | 'important' | 'optional';
  category: 'ats' | 'keywords' | 'formatting' | 'content' | 'structure';
  title: string;
  description: string;
  beforeText?: string;
  afterText?: string;
  section?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ResumeSection {
  name: string;
  content: string;
  score: number;
  suggestions: ResumeSuggestion[];
}

export interface ResumeAnalysisResult {
  scores: ResumeAnalysisScores;
  sections: ResumeSection[];
  suggestions: ResumeSuggestion[];
  strengths: string[];
  weaknesses: string[];
  keywordAnalysis: {
    missingKeywords: string[];
    presentKeywords: string[];
    overusedWords: string[];
  };
  analyzedAt: Date;
  targetRole?: string;
  industryMatch?: number;
  estimatedReadTime?: string;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface ResumeTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  headerFontSize: number;
  spacing: 'comfortable' | 'compact';
  style?: 'formal' | 'creative' | 'modern' | 'minimal';
}

export interface ProjectPlan {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  techStack: string[];
  learningGoals: string[];
  fileStructure: Record<string, string>;
  steps: Array<{
    number: number;
    title: string;
    description: string;
    code?: string;
    resources?: string[];
  }>;
  resources: Array<{
    type: 'documentation' | 'tutorial' | 'video' | 'article';
    title: string;
    url: string;
  }>;
  deployment?: {
    platform: string;
    steps: string[];
  };
}
