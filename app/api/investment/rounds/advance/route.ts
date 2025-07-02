import { db } from '@/lib/db';
import { gameRounds, teams, portfolios } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// Admin-only endpoint to advance to the next round
export async function POST() {
  try {
    const { userId } = auth();
    
    // TODO: Add admin check - replace with your actual admin check logic
    const isAdmin = userId === process.env.ADMIN_USER_ID; // Example check
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Start a transaction
    await db.transaction(async (tx) => {
      // 1. Get the current round
      const currentRound = await tx.query.gameRounds.findFirst({
        where: or(
          eq(gameRounds.status, 'open'),
          eq(gameRounds.status, 'closed')
        ),
        orderBy: (gameRounds, { desc }) => [desc(gameRounds.roundNumber)],
      });

      // 2. If there's a current round, close it
      if (currentRound) {
        // Calculate yields and update portfolios for the current round
        await tx.update(gameRounds)
          .set({ status: 'closed' })
          .where(eq(gameRounds.id, currentRound.id));

        // Update team capitals based on portfolio performance
        const roundPortfolios = await tx.query.portfolios.findMany({
          where: eq(portfolios.roundId, currentRound.id),
        });

        for (const portfolio of roundPortfolios) {
          // Simple yield calculation - in a real app, this would be more complex
          const yieldS1 = currentRound.yieldS1 || 0;
          const yieldS2 = currentRound.yieldS2 || 0;
          const yieldS3 = currentRound.yieldS3 || 0;
          const yieldS4 = currentRound.yieldS4 || 0;
          
          const totalReturn = 
            Number(portfolio.investmentS1) * (1 + Number(yieldS1)) +
            Number(portfolio.investmentS2) * (1 + Number(yieldS2)) +
            Number(portfolio.investmentS3) * (1 + Number(yieldS3)) +
            Number(portfolio.investmentS4) * (1 + Number(yieldS4));
          
          const capitalAtEnd = portfolio.capitalAtStart - 
            (Number(portfolio.investmentS1) + 
             Number(portfolio.investmentS2) + 
             Number(portfolio.investmentS3) + 
             Number(portfolio.investmentS4)) + 
            totalReturn;
          
          // Update portfolio with final capital
          await tx.update(portfolios)
            .set({ 
              capitalAtEnd: capitalAtEnd.toString(),
              isSubmitted: true 
            })
            .where(eq(portfolios.id, portfolio.id));
          
          // Update team's current capital
          await tx.update(teams)
            .set({ currentCapital: capitalAtEnd.toString() })
            .where(eq(teams.id, portfolio.teamId));
        }
      }

      // 3. Find the next round to open
      const nextRound = await tx.query.gameRounds.findFirst({
        where: eq(gameRounds.status, 'locked'),
        orderBy: (gameRounds, { asc }) => [asc(gameRounds.roundNumber)],
      });

      if (nextRound) {
        // Open the next round
        await tx.update(gameRounds)
          .set({ status: 'open' })
          .where(eq(gameRounds.id, nextRound.id));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error advancing round:', error);
    return NextResponse.json(
      { error: 'Failed to advance round' },
      { status: 500 }
    );
  }
}
