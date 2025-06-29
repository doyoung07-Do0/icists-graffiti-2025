import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { teamPortfolio, investmentRound } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { roundName } = await request.json();

    if (!roundName) {
      return NextResponse.json(
        { error: 'Round name is required' },
        { status: 400 }
      );
    }

    // Get the round ID
    const round = await db
      .select()
      .from(investmentRound)
      .where(eq(investmentRound.name, roundName))
      .limit(1);

    if (round.length === 0) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    const roundId = round[0].id;

    // Reset all portfolio entries for this round to 0
    await db
      .update(teamPortfolio)
      .set({ 
        investmentAmount: '0',
        updatedAt: new Date() 
      })
      .where(eq(teamPortfolio.roundId, roundId));

    return NextResponse.json({ 
      success: true,
      message: 'Portfolio data reset successfully' 
    });

  } catch (error) {
    console.error('Error resetting portfolio data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
