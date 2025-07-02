import { db } from '@/lib/db';
import { gameRounds } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allRounds = await db.select().from(gameRounds).orderBy(gameRounds.roundNumber);
    return NextResponse.json(allRounds);
  } catch (error) {
    console.error('Error fetching rounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rounds' },
      { status: 500 }
    );
  }
}
