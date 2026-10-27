'use client';

/**
 * Career Graph Service - Powered by Amazon DynamoDB
 * Replaces Firestore queries and document references
 */

import { getItem, putItem, queryItems, TABLES } from './dynamodb';
import type {
  CareerActivity,
  SkillNode,
  CareerGraphData,
  HeatmapDay,
  UserProfile,
} from './types';

/**
 * Logs a career activity to DynamoDB
 */
export async function logCareerActivity(
  _db: any,
  userId: string,
  activity: Omit<CareerActivity, 'id' | 'userId' | 'timestamp'>
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const activityData: CareerActivity = {
      id: activityId,
      userId,
      type: activity.type,
      metadata: activity.metadata || {},
      impact: activity.impact || 1,
      timestamp: new Date().toISOString(),
    };

    await putItem(TABLES.ACTIVITIES, {
      ...activityData,
      activityId, // Sort Key in DynamoDB
    });

    // Update career graph with new activity
    await updateCareerGraph(_db, userId);
  } catch (error) {
    console.error('[DynamoDB] Error logging career activity:', error);
    throw new Error('Failed to log career activity');
  }
}

/**
 * Fetches career activities for a user within a date range from DynamoDB
 */
export async function fetchCareerActivities(
  _db: any,
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CareerActivity[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const items = await queryItems<any>(
      TABLES.ACTIVITIES,
      'userId = :uid',
      { ':uid': userId },
      { scanIndexForward: false, limit: 365 }
    );

    const activities: CareerActivity[] = items.map((data) => ({
      id: data.activityId || data.id,
      userId: data.userId,
      type: data.type,
      timestamp: data.timestamp || new Date().toISOString(),
      metadata: data.metadata || {},
      impact: data.impact || 1,
    }));

    // Filter by date range if provided
    return activities.filter((a) => {
      const time = new Date(a.timestamp).getTime();
      if (startDate && time < startDate.getTime()) return false;
      if (endDate && time > endDate.getTime()) return false;
      return true;
    });
  } catch (error) {
    console.error('[DynamoDB] Error fetching career activities:', error);
    return [];
  }
}

/**
 * Calculates skill weight based on frequency, recency, and practice
 */
export function calculateSkillWeight(
  skillName: string,
  activities: CareerActivity[]
): number {
  const relevantActivities = activities.filter(
    (a) => a.metadata.skillName?.toLowerCase() === skillName.toLowerCase()
  );

  if (relevantActivities.length === 0) return 20;

  const frequencyScore = Math.min(relevantActivities.length * 2, 40);
  const latestActivity = relevantActivities[0];
  const daysSinceLatest = latestActivity.timestamp
    ? Math.floor(
        (Date.now() - new Date(latestActivity.timestamp).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 365;
  const recencyScore = Math.max(30 - daysSinceLatest / 10, 0);

  const avgIntensity =
    relevantActivities.reduce((sum, a) => sum + (a.impact || 1), 0) /
    relevantActivities.length;
  const intensityScore = avgIntensity * 3;

  return Math.min(frequencyScore + recencyScore + intensityScore, 100);
}

/**
 * Builds skill nodes from profile and activities
 */
export async function buildSkillNodes(
  profile: UserProfile,
  activities: CareerActivity[]
): Promise<SkillNode[]> {
  const skillMap = new Map<string, SkillNode>();

  profile.skills?.forEach((skill) => {
    const weight = calculateSkillWeight(skill.name, activities);
    const relevantActivities = activities.filter(
      (a) => a.metadata.skillName?.toLowerCase() === skill.name.toLowerCase()
    );

    const latestActivity = relevantActivities[0];
    const recency = latestActivity?.timestamp
      ? Math.floor(
          (Date.now() - new Date(latestActivity.timestamp).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 365;

    skillMap.set(skill.name.toLowerCase(), {
      id: skill.name.toLowerCase().replace(/\s+/g, '-'),
      name: skill.name,
      category: categorizeSkill(skill.name),
      weight,
      frequency: relevantActivities.length,
      recency,
      connections: [],
    });
  });

  skillMap.forEach((node, key) => {
    const relatedSkills = new Set<string>();

    activities.forEach((activity) => {
      if (activity.metadata.skillName?.toLowerCase() === key) {
        const nearbyActivities = activities.filter(
          (a) =>
            a.metadata.skillName &&
            a.metadata.skillName.toLowerCase() !== key &&
            Math.abs(
              new Date(a.timestamp).getTime() -
                new Date(activity.timestamp).getTime()
            ) <
              7 * 24 * 60 * 60 * 1000
        );
        nearbyActivities.forEach((a) => {
          if (a.metadata.skillName) {
            relatedSkills.add(a.metadata.skillName.toLowerCase());
          }
        });
      }
    });

    node.connections = Array.from(relatedSkills).map((s) =>
      s.replace(/\s+/g, '-')
    );
  });

  return Array.from(skillMap.values());
}

function categorizeSkill(
  skillName: string
): 'technical' | 'soft' | 'domain' | 'tool' | 'language' {
  const name = skillName.toLowerCase();

  if (
    ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'kotlin', 'swift'].some(
      (lang) => name.includes(lang)
    )
  ) {
    return 'language';
  }

  if (
    ['react', 'angular', 'vue', 'node', 'django', 'flask', 'spring', 'docker', 'kubernetes', 'git', 'aws', 'azure'].some(
      (tool) => name.includes(tool)
    )
  ) {
    return 'tool';
  }

  if (
    ['communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking'].some(
      (soft) => name.includes(soft)
    )
  ) {
    return 'soft';
  }

  if (
    ['machine learning', 'data science', 'web development', 'mobile', 'devops', 'security', 'blockchain'].some(
      (domain) => name.includes(domain)
    )
  ) {
    return 'domain';
  }

  return 'technical';
}

/**
 * Generates heatmap data for the last year (GitHub contribution style)
 */
export function generateHeatmapData(activities: CareerActivity[]): HeatmapDay[] {
  const heatmapData: HeatmapDay[] = [];
  const today = new Date();
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const activityMap = new Map<string, CareerActivity[]>();

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toISOString().split('T')[0];
    if (!activityMap.has(dateKey)) {
      activityMap.set(dateKey, []);
    }
    activityMap.get(dateKey)!.push(activity);
  });

  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    const dayActivities = activityMap.get(dateKey) || [];
    const count = dayActivities.length;

    let intensity = 0;
    if (count > 0) {
      if (count >= 10) intensity = 4;
      else if (count >= 7) intensity = 3;
      else if (count >= 4) intensity = 2;
      else intensity = 1;
    }

    heatmapData.push({
      date: dateKey,
      count,
      intensity,
      activities: dayActivities,
    });
  }

  return heatmapData;
}

export function calculateReadinessScore(
  currentSkills: SkillNode[],
  targetRole?: string,
  careerGoals?: string
): number {
  if (!targetRole && !careerGoals) return 0;
  if (currentSkills.length === 0) return 0;

  const totalWeight = currentSkills.reduce((sum, skill) => sum + skill.weight, 0);
  const averageWeight = totalWeight / currentSkills.length;
  const categories = new Set(currentSkills.map((s) => s.category));
  const diversityBonus = Math.min(categories.size * 5, 20);
  const recentSkills = currentSkills.filter((s) => s.recency < 30).length;
  const recencyBonus = Math.min(recentSkills * 2, 15);

  return Math.min(averageWeight + diversityBonus + recencyBonus, 100);
}

/**
 * Updates the career graph in DynamoDB
 */
export async function updateCareerGraph(
  _db: any,
  userId: string
): Promise<void> {
  if (!userId) return;

  try {
    const profile = await getItem<UserProfile>(TABLES.USERS, { userId });
    if (!profile) return;

    const activities = await fetchCareerActivities(_db, userId);
    const skills = await buildSkillNodes(profile, activities);
    const readinessScore = calculateReadinessScore(
      skills,
      undefined,
      profile.careerGoals
    );

    const graphData: CareerGraphData = {
      userId,
      currentRole: profile.experience?.[0]?.role,
      targetRole: profile.careerGoals,
      skills,
      activities: activities.slice(0, 100),
      readinessScore,
      lastUpdated: new Date().toISOString(),
    };

    await putItem(TABLES.CAREER_GRAPHS, graphData);
  } catch (error) {
    console.error('[DynamoDB] Error updating career graph:', error);
  }
}

/**
 * Fetches the career graph for a user from DynamoDB
 */
export async function fetchCareerGraph(
  _db: any,
  userId: string
): Promise<CareerGraphData | null> {
  if (!userId) return null;

  try {
    const graphData = await getItem<CareerGraphData>(TABLES.CAREER_GRAPHS, { userId });
    if (graphData) {
      return graphData;
    }

    // If no graph exists, generate one
    await updateCareerGraph(_db, userId);
    return await getItem<CareerGraphData>(TABLES.CAREER_GRAPHS, { userId });
  } catch (error) {
    console.error('[DynamoDB] Error fetching career graph:', error);
    return null;
  }
}
