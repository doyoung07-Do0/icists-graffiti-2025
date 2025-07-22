import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { final_matching } from '@/lib/db/schema';

export async function GET() {
  try {
    console.log('📊 Fetching final matching results...');

    // Fetch all matches from final_matching table
    const matches = await db
      .select({
        team: final_matching.team,
        startup: final_matching.startup,
      })
      .from(final_matching)
      .orderBy(final_matching.startup, final_matching.team);

    console.log('✅ Final matching results fetched:', matches.length);
    console.log('📋 All matches:', matches);

    return NextResponse.json({
      success: true,
      data: matches,
    });
  } catch (error) {
    console.error('❌ Error fetching final matching results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch final matching results' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
