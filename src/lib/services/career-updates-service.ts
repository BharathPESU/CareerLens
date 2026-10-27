/**
 * AI Career Updates Service
 * Aggregates career intelligence from multiple sources
 */

import { scanItems, putItem, TABLES } from '@/lib/dynamodb';

export interface CareerUpdate {
  id: string;
  type: 'job_trend' | 'certification' | 'internship' | 'industry_news' | 'skill_demand';
  title: string;
  description: string;
  source: string;
  sourceUrl?: string;
  tags: string[];
  relevanceScore?: number;
  createdAt: Date;
  expiresAt?: Date;
  imageUrl?: string;
  actionLink?: string;
  actionText?: string;
  trending?: boolean;
  views?: number;
}

export interface SkillTrend {
  skill: string;
  demandChange: number; // Percentage change
  avgSalary?: string;
  jobCount: number;
  trend: 'rising' | 'stable' | 'declining';
  relatedRoles: string[];
}

export interface CertificationOpportunity {
  id: string;
  title: string;
  provider: string;
  description: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isFree: boolean;
  price?: string;
  enrollLink: string;
  deadline?: Date;
  skills: string[];
  imageUrl?: string;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'internship' | 'contract' | 'remote';
  description: string;
  skills: string[];
  postedDate: Date;
  applyLink: string;
  salary?: string;
  experience?: string;
}

/**
/**
 * Fetch latest career updates from DynamoDB
 */
export async function getLatestCareerUpdates(
  maxResults: number = 20,
  filterType?: CareerUpdate['type']
): Promise<CareerUpdate[]> {
  try {
    const items = await scanItems<CareerUpdate>(TABLES.CAREER_UPDATES, { limit: maxResults });
    if (!items || items.length === 0) return [];
    
    let filtered = items;
    if (filterType) {
      filtered = filtered.filter(u => u.type === filterType);
    }
    return filtered.slice(0, maxResults);
  } catch (error) {
    console.error('[DynamoDB] Error fetching career updates:', error);
    return [];
  }
}

/**
 * Fetch trending skills
 */
export async function getTrendingSkills(maxResults: number = 10): Promise<SkillTrend[]> {
  try {
    const items = await scanItems<SkillTrend>(TABLES.MARKET_DATA, { limit: maxResults });
    if (items && items.length > 0) return items.slice(0, maxResults);
    return getMockTrendingSkills().slice(0, maxResults);
  } catch (error) {
    console.error('[DynamoDB] Error fetching trending skills:', error);
    return getMockTrendingSkills().slice(0, maxResults);
  }
}

/**
 * Fetch certification opportunities
 */
export async function getCertificationOpportunities(
  maxResults: number = 10
): Promise<CertificationOpportunity[]> {
  try {
    const items = await scanItems<CertificationOpportunity>(TABLES.RESOURCES, { limit: maxResults });
    if (items && items.length > 0) return items.slice(0, maxResults);
    return getMockCertifications().slice(0, maxResults);
  } catch (error) {
    console.error('[DynamoDB] Error fetching certifications:', error);
    return getMockCertifications().slice(0, maxResults);
  }
}

/**
 * Fetch job opportunities
 */
export async function getJobOpportunities(
  maxResults: number = 15
): Promise<JobOpportunity[]> {
  try {
    return getMockJobOpportunities().slice(0, maxResults);
  } catch (error) {
    console.error('[DynamoDB] Error fetching job opportunities:', error);
    return getMockJobOpportunities().slice(0, maxResults);
  }
}

/**
 * Get personalized career updates based on user profile
 */
export async function getPersonalizedUpdates(
  userSkills: string[],
  userInterests: string[],
  maxResults: number = 10
): Promise<CareerUpdate[]> {
  try {
    const allUpdates = await getLatestCareerUpdates(50);
    
    // Score each update based on relevance to user profile
    const scoredUpdates = allUpdates.map(update => {
      let score = 0;
      
      // Match tags with user skills
      update.tags.forEach(tag => {
        if (userSkills.some(skill => skill.toLowerCase().includes(tag.toLowerCase()))) {
          score += 2;
        }
        if (userInterests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()))) {
          score += 1;
        }
      });
      
      // Boost trending items
      if (update.trending) score += 3;
      
      return { ...update, relevanceScore: score };
    });

    // Sort by relevance and return top results
    return scoredUpdates
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, maxResults);
  } catch (error) {
    console.error('Error getting personalized updates:', error);
    return [];
  }
}

/**
 * Add a new career update (used by Cloud Functions)
 */
export async function addCareerUpdate(update: Omit<CareerUpdate, 'id'>): Promise<string> {
  try {
    const id = `upd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await putItem(TABLES.CAREER_UPDATES, {
      ...update,
      id,
      category: update.type,
      createdAt: update.createdAt ? update.createdAt.toISOString() : new Date().toISOString(),
      expiresAt: update.expiresAt ? update.expiresAt.toISOString() : null,
      views: 0,
    });
    return id;
  } catch (error) {
    console.error('[DynamoDB] Error adding career update:', error);
    throw error;
  }
}

// Mock data for development (when Firestore is empty)
function getMockTrendingSkills(): SkillTrend[] {
  return [
    {
      skill: 'Generative AI',
      demandChange: 285,
      avgSalary: '$120k-$180k',
      jobCount: 1247,
      trend: 'rising',
      relatedRoles: ['AI Engineer', 'ML Engineer', 'Prompt Engineer']
    },
    {
      skill: 'React/Next.js',
      demandChange: 145,
      avgSalary: '$90k-$150k',
      jobCount: 3421,
      trend: 'rising',
      relatedRoles: ['Frontend Developer', 'Full Stack Developer']
    },
    {
      skill: 'Cloud Architecture',
      demandChange: 132,
      avgSalary: '$110k-$170k',
      jobCount: 2156,
      trend: 'rising',
      relatedRoles: ['Cloud Architect', 'DevOps Engineer', 'Solutions Architect']
    },
    {
      skill: 'Python',
      demandChange: 98,
      avgSalary: '$95k-$160k',
      jobCount: 4532,
      trend: 'stable',
      relatedRoles: ['Data Scientist', 'Backend Developer', 'AI Engineer']
    },
    {
      skill: 'Kubernetes',
      demandChange: 87,
      avgSalary: '$105k-$165k',
      jobCount: 1876,
      trend: 'rising',
      relatedRoles: ['DevOps Engineer', 'Platform Engineer', 'SRE']
    },
  ];
}

function getMockCertifications(): CertificationOpportunity[] {
  return [
    {
      id: '1',
      title: 'Google Cloud Professional Cloud Architect',
      provider: 'Google Cloud',
      description: 'Learn to design, develop, and manage robust, secure cloud architecture solutions',
      duration: '8 weeks',
      level: 'advanced',
      isFree: false,
      price: '$200',
      enrollLink: 'https://cloud.google.com/certification/cloud-architect',
      skills: ['GCP', 'Cloud Architecture', 'Kubernetes'],
      imageUrl: 'https://cloud.google.com/images/social-icon-google-cloud-1200-630.png'
    },
    {
      id: '2',
      title: 'Generative AI with Large Language Models',
      provider: 'Coursera',
      description: 'Learn the fundamentals of generative AI and build LLM-powered applications',
      duration: '4 weeks',
      level: 'intermediate',
      isFree: true,
      enrollLink: 'https://www.coursera.org/learn/generative-ai-with-llms',
      skills: ['Generative AI', 'Python', 'Machine Learning'],
    },
    {
      id: '3',
      title: 'AWS Certified Solutions Architect',
      provider: 'AWS',
      description: 'Validate your ability to design distributed systems on AWS',
      duration: '12 weeks',
      level: 'intermediate',
      isFree: false,
      price: '$150',
      enrollLink: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      skills: ['AWS', 'Cloud Computing', 'Architecture'],
    },
  ];
}

function getMockJobOpportunities(): JobOpportunity[] {
  return [
    {
      id: '1',
      title: 'AI/ML Engineering Intern',
      company: 'Google',
      location: 'Remote',
      type: 'internship',
      description: 'Work on cutting-edge AI/ML projects with Google Research team',
      skills: ['Python', 'TensorFlow', 'Machine Learning'],
      postedDate: new Date(),
      applyLink: 'https://careers.google.com/',
      salary: '$8k-$10k/month',
      experience: 'Student'
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      company: 'Microsoft',
      location: 'Bangalore, India',
      type: 'full-time',
      description: 'Build scalable web applications using modern tech stack',
      skills: ['React', 'Node.js', 'Azure', 'TypeScript'],
      postedDate: new Date(),
      applyLink: 'https://careers.microsoft.com/',
      salary: '₹15-25 LPA',
      experience: '2-4 years'
    },
    {
      id: '3',
      title: 'Cloud Solutions Architect',
      company: 'Amazon Web Services',
      location: 'Hyderabad, India',
      type: 'full-time',
      description: 'Design and implement cloud solutions for enterprise clients',
      skills: ['AWS', 'Kubernetes', 'Terraform', 'Python'],
      postedDate: new Date(),
      applyLink: 'https://www.amazon.jobs/',
      salary: '₹20-35 LPA',
      experience: '3-5 years'
    },
  ];
}
