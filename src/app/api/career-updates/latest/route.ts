/**
 * API Route: Get Latest Career Updates
 * Fetches the most recent career intelligence data from DynamoDB
 */

import { NextRequest, NextResponse } from 'next/server';
import { scanItems, getItem, TABLES } from '@/lib/dynamodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Try to get specific date snapshot
    let snapshot = await getItem(TABLES.CAREER_UPDATES, { id: date });

    if (!snapshot) {
      // Scan recent updates
      const allUpdates = await scanItems(TABLES.CAREER_UPDATES, { limit: 10 });
      if (!allUpdates || allUpdates.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No career updates available yet'
        }, { status: 404 });
      }
      snapshot = allUpdates[0];
    }

    return NextResponse.json({
      success: true,
      date,
      data: snapshot
    });
  } catch (error: any) {
    console.error('[DynamoDB] Error fetching career updates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch career updates'
      },
      { status: 500 }
    );
  }
}
