import { NextRequest, NextResponse } from 'next/server';

/**
 * Unified Course Scraping API
 * Handles requests to scrape courses from all platforms
 */

export interface CourseData {
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

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const platforms = searchParams.get('platforms')?.split(',') || 'all';
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const results: { [key: string]: CourseData[] } = {};

        // Platform-specific scraping logic
        const platformsToScrape = platforms === 'all' || platforms.includes('all')
            ? ALL_PLATFORMS
            : platforms;

        const scrapePromises = (Array.isArray(platformsToScrape) ? platformsToScrape : [platformsToScrape]).map(
            async (platform: string) => {
                try {
                    const courses = await scrapePlatform(platform, query, limit);
                    return { platform, courses, status: 'success' };
                } catch (error: any) {
                    console.error(`Error scraping ${platform}:`, error);
                    return { platform, courses: [], status: 'error', error: error.message };
                }
            }
        );

        const scrapeResults = await Promise.allSettled(scrapePromises);

        const successfulResults = scrapeResults
            .filter((r) => r.status === 'fulfilled')
            .map((r) => (r as PromiseFulfilledResult<any>).value);

        const allCourses = successfulResults.flatMap((r) => r.courses);

        // Remove duplicates and sort
        const uniqueCourses = removeDuplicates(allCourses);
        const sortedCourses = sortCourses(uniqueCourses);

        return NextResponse.json({
            success: true,
            totalPlatforms: successfulResults.length,
            totalCourses: sortedCourses.length,
            courses: sortedCourses.slice(0, limit),
            platformStatus: successfulResults.map((r) => ({
                platform: r.platform,
                status: r.status,
                courses: r.courses.length,
                error: r.error,
            })),
        });
    } catch (error: any) {
        console.error('Course scraping error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to scrape courses',
                courses: [],
            },
            { status: 500 }
        );
    }
}

// List of all supported platforms
const ALL_PLATFORMS = [
    'nptel',
    'aws_educate',
    'google_cloud',
    'edx',
    'coursera',
    'mit_ocw',
    'harvard_online',
    'udacity',
    'stanford_online',
    'microsoft_learn',
    'ibm_skillsbuild',
    'freecodecamp',
    'khan_academy',
    'futurelearn',
    'openlearn',
    'cloudflare',
    'meta_developer',
    'oracle_university',
    'geeksforgeeks',
    'hackerrank',
];

/**
 * Scrape a specific platform
 */
async function scrapePlatform(
    platform: string,
    query: string,
    limit: number
): Promise<CourseData[]> {
    switch (platform.toLowerCase()) {
        case 'nptel':
            return scrapeNPTEL(query, limit);
        case 'aws_educate':
            return scrapeAWS(query, limit);
        case 'google_cloud':
            return scrapeGoogleCloud(query, limit);
        case 'edx':
            return scrapeEdX(query, limit);
        case 'coursera':
            return scrapeCoursera(query, limit);
        case 'mit_ocw':
            return scrapeMITOCW(query, limit);
        case 'harvard_online':
            return scrapeHarvard(query, limit);
        case 'udacity':
            return scrapeUdacity(query, limit);
        case 'stanford_online':
            return scrapeStanford(query, limit);
        case 'microsoft_learn':
            return scrapeMicrosoft(query, limit);
        case 'ibm_skillsbuild':
            return scrapeIBM(query, limit);
        case 'freecodecamp':
            return scrapeFreeCodeCamp(query, limit);
        case 'khan_academy':
            return scrapeKhanAcademy(query, limit);
        case 'futurelearn':
            return scrapeFutureLearn(query, limit);
        case 'openlearn':
            return scrapeOpenLearn(query, limit);
        case 'cloudflare':
            return scrapeCloudflare(query, limit);
        case 'meta_developer':
            return scrapeMeta(query, limit);
        case 'oracle_university':
            return scrapeOracle(query, limit);
        case 'geeksforgeeks':
            return scrapeGeeksForGeeks(query, limit);
        case 'hackerrank':
            return scrapeHackerRank(query, limit);
        default:
            return [];
    }
}

// Mock scrapers (to be replaced with actual implementations)
async function scrapeNPTEL(query: string, limit: number): Promise<CourseData[]> {
    // Placeholder - implement actual scraping logic
    return generateMockCourses('NPTEL', query, Math.min(limit, 10));
}

async function scrapeAWS(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('AWS Educate', query, Math.min(limit, 10));
}

async function scrapeGoogleCloud(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Google Cloud Skills Boost', query, Math.min(limit, 10));
}

async function scrapeEdX(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('edX', query, Math.min(limit, 10));
}

async function scrapeCoursera(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Coursera', query, Math.min(limit, 10));
}

async function scrapeMITOCW(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('MIT OpenCourseWare', query, Math.min(limit, 8));
}

async function scrapeHarvard(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Harvard Online', query, Math.min(limit, 8));
}

async function scrapeUdacity(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Udacity', query, Math.min(limit, 10));
}

async function scrapeStanford(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Stanford Online', query, Math.min(limit, 8));
}

async function scrapeMicrosoft(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Microsoft Learn', query, Math.min(limit, 15));
}

async function scrapeIBM(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('IBM SkillsBuild', query, Math.min(limit, 10));
}

async function scrapeFreeCodeCamp(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('FreeCodeCamp', query, Math.min(limit, 12));
}

async function scrapeKhanAcademy(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Khan Academy', query, Math.min(limit, 15));
}

async function scrapeFutureLearn(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('FutureLearn', query, Math.min(limit, 10));
}

async function scrapeOpenLearn(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('OpenLearn', query, Math.min(limit, 10));
}

async function scrapeCloudflare(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Cloudflare Learning Center', query, Math.min(limit, 8));
}

async function scrapeMeta(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Meta Developer Learning Hub', query, Math.min(limit, 8));
}

async function scrapeOracle(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('Oracle University', query, Math.min(limit, 10));
}

async function scrapeGeeksForGeeks(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('GeeksForGeeks', query, Math.min(limit, 12));
}

async function scrapeHackerRank(query: string, limit: number): Promise<CourseData[]> {
    return generateMockCourses('HackerRank', query, Math.min(limit, 10));
}

/**
 * Generate mock courses for testing
 */
function generateMockCourses(platform: string, query: string, count: number): CourseData[] {
    const topics = query ? [query] : ['Python', 'JavaScript', 'DevOps', 'Machine Learning', 'Data Science', 'Cloud Computing'];
    const levels: Array<'Beginner' | 'Intermediate' | 'Advanced'> = ['Beginner', 'Intermediate', 'Advanced'];
    const categories = ['Programming', 'Data Science', 'Cloud Computing', 'Web Development', 'AI/ML', 'DevOps'];

    return Array.from({ length: count }, (_, i) => {
        const topic = topics[i % topics.length];
        const level = levels[i % levels.length];
        const category = categories[i % categories.length];

        return {
            id: `${platform.toLowerCase().replace(/\s+/g, '_')}_${i + 1}`,
            title: `${topic} - ${level} Course`,
            platform,
            instructor: `Instructor ${i + 1}`,
            rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
            difficulty: level,
            duration: `${4 + Math.floor(Math.random() * 8)} weeks`,
            category,
            skills: [topic, level, category].filter(Boolean),
            url: `https://${platform.toLowerCase().replace(/\s+/g, '-')}.com/course/${i + 1}`,
            isFree: true,
            thumbnail: `https://picsum.photos/seed/${platform}_${i}/400/300`,
            enrolled: Math.floor(Math.random() * 100000) + 1000,
            description: `Learn ${topic} from ${level} level. This course covers essential concepts and hands-on projects to master ${topic}.`,
        };
    });
}

/**
 * Remove duplicate courses based on URL
 */
function removeDuplicates(courses: CourseData[]): CourseData[] {
    return Array.from(new Map(courses.map((c) => [c.url, c])).values());
}

/**
 * Sort courses by relevance, rating, and platform priority
 */
function sortCourses(courses: CourseData[]): CourseData[] {
    const platformPriority: { [key: string]: number } = {
        'NPTEL': 1,
        'Google Cloud Skills Boost': 2,
        'AWS Educate': 2,
        'edX': 3,
        'Coursera': 3,
        'Microsoft Learn': 3,
        'IBM SkillsBuild': 3,
        'FreeCodeCamp': 2,
        'Khan Academy': 2,
        'MIT OpenCourseWare': 4,
        'Harvard Online': 4,
        'Stanford Online': 4,
        'Udacity': 5,
        'FutureLearn': 5,
        'OpenLearn': 4,
        'Cloudflare Learning Center': 4,
        'Meta Developer Learning Hub': 4,
        'Oracle University': 4,
        'GeeksForGeeks': 5,
        'HackerRank': 5,
    };

    return courses.sort((a, b) => {
        // Priority 1: Platform priority
        const aPriority = platformPriority[a.platform] || 10;
        const bPriority = platformPriority[b.platform] || 10;

        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // Priority 2: Rating
        if (a.rating !== b.rating) {
            return b.rating - a.rating;
        }

        // Priority 3: Enrollment
        return b.enrolled - a.enrolled;
    });
}
