/**
 * Community Service - Student Reviews & Discussions
 * Powered by Amazon DynamoDB (Replaces Firebase Firestore)
 */

import { putItem, scanItems, getItem, deleteItem, TABLES } from '@/lib/dynamodb';
import { getStoredUser } from '@/lib/cognito-auth';

export interface Review {
  id: string;
  title: string;
  content: string;
  author: {
    uid: string;
    name: string;
    email?: string;
    photoURL?: string;
  };
  category: 'KCET' | 'NEET' | 'JEE' | 'COMEDK' | 'GATE' | 'College Reviews';
  college?: string;
  year?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  photos?: string[];
  upvotes: number;
  downvotes: number;
  verified: boolean;
  moderated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmission {
  title: string;
  content: string;
  category: Review['category'];
  college?: string;
  year?: string;
  rating: Review['rating'];
  photos?: string[];
}

/**
 * Submit a new review
 */
export async function submitReview(reviewData: ReviewSubmission): Promise<string> {
  try {
    const user = getStoredUser();

    if (!user) {
      throw new Error('User must be authenticated to submit reviews');
    }

    // Content moderation check
    const isAppropriate = await moderateContent(reviewData.content);
    if (!isAppropriate) {
      throw new Error('Review content violates community guidelines');
    }

    const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const review: Review = {
      id,
      title: reviewData.title,
      content: reviewData.content,
      author: {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
      },
      category: reviewData.category,
      college: reviewData.college || '',
      year: reviewData.year || '',
      rating: reviewData.rating,
      photos: reviewData.photos || [],
      upvotes: 0,
      downvotes: 0,
      verified: false,
      moderated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await putItem(TABLES.COMMUNITY_REVIEWS, review);
    console.log('Review submitted successfully to DynamoDB:', id);
    return id;
  } catch (error) {
    console.error('[DynamoDB] Error submitting review:', error);
    throw error;
  }
}

/**
 * Get reviews by category
 */
export async function getReviewsByCategory(
  category: Review['category'],
  maxResults: number = 50
): Promise<Review[]> {
  try {
    const allReviews = await getAllReviews(100);
    return allReviews
      .filter((r) => r.category === category)
      .slice(0, maxResults);
  } catch (error) {
    console.error('[DynamoDB] Error fetching reviews by category:', error);
    return [];
  }
}

/**
 * Get all reviews (public read access)
 */
export async function getAllReviews(maxResults: number = 50): Promise<Review[]> {
  try {
    const items = await scanItems<Review>(TABLES.COMMUNITY_REVIEWS, { limit: maxResults });
    if (!items || items.length === 0) {
      return getMockReviews().slice(0, maxResults);
    }
    return items.slice(0, maxResults);
  } catch (error) {
    console.error('[DynamoDB] Error fetching reviews:', error);
    return getMockReviews().slice(0, maxResults);
  }
}

/**
 * Vote on a review (upvote/downvote)
 */
export async function voteReview(
  reviewId: string,
  voteType: 'upvote' | 'downvote'
): Promise<void> {
  try {
    const user = getStoredUser();
    if (!user) {
      throw new Error('User must be authenticated to vote');
    }

    const review = await getItem<Review>(TABLES.COMMUNITY_REVIEWS, { id: reviewId });
    if (!review) return;

    if (voteType === 'upvote') {
      review.upvotes = (review.upvotes || 0) + 1;
    } else {
      review.downvotes = (review.downvotes || 0) + 1;
    }

    review.updatedAt = new Date().toISOString();
    await putItem(TABLES.COMMUNITY_REVIEWS, review);
  } catch (error) {
    console.error('[DynamoDB] Error voting on review:', error);
    throw error;
  }
}

/**
 * Content Moderation using free Gemini API
 */
async function moderateContent(content: string): Promise<boolean> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return true;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following content for inappropriate material, spam, offensive language, or harmful content. Respond with ONLY "APPROPRIATE" or "INAPPROPRIATE".\n\nContent: ${content}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();
    return result === 'APPROPRIATE';
  } catch (error) {
    console.error('Error moderating content:', error);
    return true;
  }
}

/**
 * Mock/seeded reviews
 */
export function getMockReviews(): Review[] {
  return [
    {
      id: 'mock-1',
      title: 'KCET 2024 - My Journey to 95 Percentile',
      content: 'Sharing my preparation strategy for KCET 2024. I focused heavily on PYQs (Previous Year Questions) and NCERT books. Mock tests were crucial for time management.',
      author: {
        uid: 'user-1',
        name: 'Rahul Sharma',
      },
      category: 'KCET',
      college: 'PES University, Bangalore',
      year: '2024',
      rating: 5,
      upvotes: 42,
      downvotes: 2,
      verified: true,
      moderated: true,
      createdAt: '2024-05-15T10:30:00Z',
      updatedAt: '2024-05-15T10:30:00Z',
    },
    {
      id: 'mock-2',
      title: 'RV College of Engineering - Honest 4-Year Review',
      content: 'RVCE has excellent placements, especially for CSE/ISE branches. The faculty is experienced, though the academic pressure can be high. Campus life is vibrant.',
      author: {
        uid: 'user-2',
        name: 'Priya Patel',
      },
      category: 'College Reviews',
      college: 'RV College of Engineering',
      year: '2023',
      rating: 4,
      upvotes: 89,
      downvotes: 5,
      verified: true,
      moderated: true,
      createdAt: '2024-04-20T14:15:00Z',
      updatedAt: '2024-04-20T14:15:00Z',
    },
  ];
}
