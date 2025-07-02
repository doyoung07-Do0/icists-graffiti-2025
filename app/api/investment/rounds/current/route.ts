import { db } from '@/lib/db';
import { gameRounds } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Find the current round (status is 'open' or the most recent 'closed' round)
    const currentRound = await db.query.gameRounds.findFirst({
      where: or(
        eq(gameRounds.status, 'open'),
        eq(gameRounds.status, 'closed')
      ),
      orderBy: (gameRounds, { desc }) => [desc(gameRounds.roundNumber)],
    });

    if (!currentRound) {
      // If no open or closed rounds, check if there's a locked round (game not started)
      const lockedRound = await db.query.gameRounds.findFirst({
        where: eq(gameRounds.status, 'locked'),
        orderBy: (gameRounds, { asc }) => [asc(gameRounds.roundNumber)],
      });
      
      return NextResponse.json(lockedRound || null);
    }

    return NextResponse.json(currentRound);
  } catch (error) {
    console.error('Error fetching current round:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current round' },
      { status: 500 }
    );
  }
}
