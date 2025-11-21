/**
 * Comprehensive Free Course Scraping Service
 * Supports 20+ Educational Platforms
 */

export interface ScrapedCourse {
    id: string;
    title: string;
    platform: string;
    instructor: string;
    rating: number;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | '';
    duration: string;
    category: string;
    skills: string[];
    url: string;
    isFree: boolean;
    thumbnail: string;
    enrolled: number;
    description: string;
}

export interface PlatformScrapeResult {
    platform: string;
    status: 'success' | 'error' | 'timeout';
    courses: ScrapedCourse[];
    error?: string;
    scrapedAt: Date;
}

// Platform URLs and configurations
const PLATFORMS = {
    NPTEL: {
        name: 'NPTEL',
        url: 'https://nptel.ac.in/courses',
        apiUrl: 'https://nptel.ac.in/api/courses',
        priority: 1,
    },
    AWS_EDUCATE: {
        name: 'AWS Educate',
        url: 'https://aws.amazon.com/education/awseducate/',
        apiUrl: 'https://www.awsacademy.com/SitePages/CourseContent.aspx',
        priority: 2,
    },
    GOOGLE_CLOUD: {
        name: 'Google Cloud Skills Boost',
        url: 'https://www.cloudskillsboost.google/',
        apiUrl: 'https://www.cloudskillsboost.google/catalog',
        priority: 2,
    },
    EDX: {
        name: 'edX',
        url: 'https://www.edx.org',
        apiUrl: 'https://www.edx.org/api/discovery/v1/courses',
        priority: 3,
    },
    COURSERA: {
        name: 'Coursera',
        url: 'https://www.coursera.org',
        apiUrl: 'https://www.coursera.org/api/courses.v1',
        priority: 3,
    },
    MIT_OCW: {
        name: 'MIT OpenCourseWare',
        url: 'https://ocw.mit.edu',
        apiUrl: 'https://ocw.mit.edu/search/',
        priority: 4,
    },
    HARVARD_ONLINE: {
        name: 'Harvard Online',
        url: 'https://online-learning.harvard.edu',
        apiUrl: 'https://online-learning.harvard.edu/catalog',
        priority: 4,
    },
    UDACITY: {
        name: 'Udacity',
        url: 'https://www.udacity.com',
        apiUrl: 'https://www.udacity.com/api/courses',
        priority: 5,
    },
    STANFORD_ONLINE: {
        name: 'Stanford Online',
        url: 'https://online.stanford.edu',
        apiUrl: 'https://online.stanford.edu/courses',
        priority: 4,
    },
    MICROSOFT_LEARN: {
        name: 'Microsoft Learn',
        url: 'https://learn.microsoft.com',
        apiUrl: 'https://learn.microsoft.com/api/catalog',
        priority: 3,
    },
    IBM_SKILLSBUILD: {
        name: 'IBM SkillsBuild',
        url: 'https://skillsbuild.org',
        apiUrl: 'https://skillsbuild.org/api/courses',
        priority: 3,
    },
    FREECODECAMP: {
        name: 'FreeCodeCamp',
        url: 'https://www.freecodecamp.org',
        apiUrl: 'https://www.freecodecamp.org/api/learn',
        priority: 2,
    },
    KHAN_ACADEMY: {
        name: 'Khan Academy',
        url: 'https://www.khanacademy.org',
        apiUrl: 'https://www.khanacademy.org/api/internal/graphql',
        priority: 2,
    },
    FUTURELEARN: {
        name: 'FutureLearn',
        url: 'https://www.futurelearn.com',
        apiUrl: 'https://www.futurelearn.com/courses',
        priority: 5,
    },
    OPENLEARN: {
        name: 'OpenLearn',
        url: 'https://www.open.edu/openlearn',
        apiUrl: 'https://www.open.edu/openlearn/free-courses',
        priority: 4,
    },
    CLOUDFLARE_LEARNING: {
        name: 'Cloudflare Learning Center',
        url: 'https://www.cloudflare.com/learning',
        apiUrl: 'https://www.cloudflare.com/learning/',
        priority: 4,
    },
    META_DEVELOPER: {
        name: 'Meta Developer Learning Hub',
        url: 'https://developers.facebook.com/developercircles/training',
        apiUrl: 'https://developers.facebook.com/docs/training',
        priority: 4,
    },
    ORACLE_UNIVERSITY: {
        name: 'Oracle University',
        url: 'https://education.oracle.com/learn',
        apiUrl: 'https://education.oracle.com/api/courses',
        priority: 4,
    },
    GEEKSFORGEEKS: {
        name: 'GeeksForGeeks',
        url: 'https://practice.geeksforgeeks.org',
        apiUrl: 'https://practice.geeksforgeeks.org/courses',
        priority: 5,
    },
    HACKERRANK: {
        name: 'HackerRank',
        url: 'https://www.hackerrank.com',
        apiUrl: 'https://www.hackerrank.com/rest/contests/master',
        priority: 5,
    },
};

/**
 * Scrape courses from a single platform using server-side API
 */
async function scrapePlatform(
    platformKey: keyof typeof PLATFORMS,
    query: string = ''
): Promise<PlatformScrapeResult> {
    const platform = PLATFORMS[platformKey];
    const startTime = Date.now();

    try {
        // Use Next.js API route to perform server-side scraping
        const response = await fetch(`/api/scrapers/${platformKey.toLowerCase()}?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            platform: platform.name,
            status: 'success',
            courses: data.courses || [],
            scrapedAt: new Date(),
        };
    } catch (error: any) {
        console.error(`Failed to scrape ${platform.name}:`, error);
        return {
            platform: platform.name,
            status: error.name === 'TimeoutError' ? 'timeout' : 'error',
            courses: [],
            error: error.message,
            scrapedAt: new Date(),
        };
    }
}

/**
 * Scrape all platforms simultaneously
 */
export async function scrapeAllPlatforms(
    query: string = '',
    onProgress?: (platform: string, status: string) => void
): Promise<PlatformScrapeResult[]> {
    const platformKeys = Object.keys(PLATFORMS) as Array<keyof typeof PLATFORMS>;

    // Create promises for all platforms
    const scrapePromises = platformKeys.map(async (key) => {
        if (onProgress) {
            onProgress(PLATFORMS[key].name, 'scraping');
        }

        const result = await scrapePlatform(key, query);

        if (onProgress) {
            onProgress(PLATFORMS[key].name, result.status);
        }

        return result;
    });

    // Execute all scrapes in parallel
    const results = await Promise.allSettled(scrapePromises);

    // Process results
    return results.map((result, index) => {
        if (result.status === 'fulfilled') {
            return result.value;
        } else {
            // Handle rejected promises
            const platform = PLATFORMS[platformKeys[index]];
            return {
                platform: platform.name,
                status: 'error' as const,
                courses: [],
                error: result.reason?.message || 'Unknown error',
                scrapedAt: new Date(),
            };
        }
    });
}

/**
 * Merge and sort courses from multiple platforms
 */
export function mergeCourses(
    results: PlatformScrapeResult[],
    sortBy: 'relevance' | 'rating' | 'platform' = 'relevance'
): ScrapedCourse[] {
    // Flatten all courses
    const allCourses = results.flatMap((r) => r.courses);

    // Remove duplicates based on URL
    const uniqueCourses = Array.from(
        new Map(allCourses.map((course) => [course.url, course])).values()
    );

    // Sort courses
    const sorted = [...uniqueCourses].sort((a, b) => {
        switch (sortBy) {
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);

            case 'platform':
                const aPriority = Object.values(PLATFORMS).find(p => p.name === a.platform)?.priority || 10;
                const bPriority = Object.values(PLATFORMS).find(p => p.name === b.platform)?.priority || 10;
                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }
                return (b.rating || 0) - (a.rating || 0);

            case 'relevance':
            default:
                // Score based on multiple factors
                const scoreA = (a.rating || 0) * 2 + (a.enrolled / 10000);
                const scoreB = (b.rating || 0) * 2 + (b.enrolled / 10000);
                return scoreB - scoreA;
        }
    });

    return sorted;
}

/**
 * Get scraping status summary
 */
export function getScrapeStatusSummary(results: PlatformScrapeResult[]): {
    total: number;
    success: number;
    error: number;
    timeout: number;
    totalCourses: number;
} {
    return {
        total: results.length,
        success: results.filter((r) => r.status === 'success').length,
        error: results.filter((r) => r.status === 'error').length,
        timeout: results.filter((r) => r.status === 'timeout').length,
        totalCourses: results.reduce((sum, r) => sum + r.courses.length, 0),
    };
}

/**
 * Get platform list with priority
 */
export function getPlatformList(): Array<{ name: string; priority: number }> {
    return Object.values(PLATFORMS)
        .sort((a, b) => a.priority - b.priority)
        .map(({ name, priority }) => ({ name, priority }));
}
