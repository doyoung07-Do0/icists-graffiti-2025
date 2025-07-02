// Using relative imports to avoid module resolution issues
import { db } from '../../../../lib/db';
import { portfolios, teams, gameRounds } from '../../../../lib/db/schema';
import type { Team, Portfolio } from '../../../../lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Development mode check
const isDevelopment = process.env.NODE_ENV === 'development';

// Dynamic import for Clerk to avoid dependency issues
let auth: any;
if (!isDevelopment) {
  try {
    auth = (await import('@clerk/nextjs/server')).auth;
  } catch (error) {
    console.error('Failed to load Clerk auth:', error);
    throw new Error('Authentication service is required in production');
  }
} else {
  console.warn('Running in development mode - using mock authentication');
  auth = {
    userId: () => process.env.ADMIN_USER_ID || 'team-1', // Default to team-1 in development
  };
}

// Type for the request body when creating/updating a portfolio
type PortfolioRequest = {
  investments: {
    s1: string;
    s2: string;
    s3: string;
    s4: string;
  };
  roundId?: number;
};

export async function GET() {
  try {
    let userId = auth?.userId ? auth.userId() : null;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In development, use team-1 as the default user ID if needed
    if (isDevelopment && !userId.startsWith('team-')) {
      console.log('Development mode: Using team-1 as default user ID');
      userId = 'team-1';
    }

    // Get the current round (open or closed)
    const currentRound = await db.query.gameRounds.findFirst({
      where: or(
        eq(gameRounds.status, 'open'),
        eq(gameRounds.status, 'closed')
      ),
      orderBy: (gameRounds, { desc }) => [desc(gameRounds.roundNumber)],
    });

    if (!currentRound) {
      return NextResponse.json(
        { error: 'No rounds found' },
        { status: 404 }
      );
    }

    // Get the user's team
    const userTeam = await db.query.teams.findFirst({
      where: eq(teams.userId, userId)
    });

    if (!userTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Get all portfolios for the user's team
    const teamPortfolios = await db.query.portfolios.findMany({
      where: and(
        eq(portfolios.teamId, userTeam.id),
        eq(portfolios.roundId, currentRound.id)
      ),
    });

    return NextResponse.json(teamPortfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let userId = auth?.userId ? auth.userId() : null;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { 
      investments,  // { s1: number, s2: number, s3: number, s4: number }
      roundId 
    } = await request.json();

    // Find the current round - either by provided ID or find the open one
    let currentRound;
    
    if (roundId) {
      // If roundId is provided, find that specific round
      currentRound = await db.query.gameRounds.findFirst({
        where: and(
          or(
            eq(gameRounds.status, 'open'),
            eq(gameRounds.status, 'closed')
          ),
          eq(gameRounds.id, roundId)
        ),
      });
    } else {
      // Otherwise, find the current open round
      currentRound = await db.query.gameRounds.findFirst({
        where: eq(gameRounds.status, 'open'),
        orderBy: (gameRounds, { asc }) => [asc(gameRounds.roundNumber)]
      });
    }

    if (!currentRound) {
      return NextResponse.json(
        { error: roundId ? 'Round not found' : 'No open round found' },
        { status: 400 }
      );
    }
    
    if (currentRound.status !== 'open') {
      return NextResponse.json(
        { error: 'The selected round is not open for submissions' },
        { status: 400 }
      );
    }

    // Get the user's team
    let userTeam;
    
    if (isDevelopment) {
      // In development, use team-1 as the default team
      console.log('Development mode: Looking up team for user ID:', userId);
      userTeam = await db.query.teams.findFirst({
        where: eq(teams.userId, 'team-1')
      });
      
      if (!userTeam) {
        // If team-1 doesn't exist, fall back to the first team
        console.log('Team-1 not found, falling back to first team');
        userTeam = await db.query.teams.findFirst();
      }
    } else {
      // In production, find the team by user ID
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required in production' },
          { status: 400 }
        );
      }
      
      userTeam = await db.query.teams.findFirst({
        where: eq(teams.userId, userId)
      });
    }

    if (!userTeam) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Calculate total investment
    const totalInvestment = 
      Number(investments.s1) + 
      Number(investments.s2) + 
      Number(investments.s3) + 
      Number(investments.s4);

    // Check if team has enough capital
    if (totalInvestment > Number(userTeam.currentCapital)) {
      return NextResponse.json(
        { error: 'Insufficient capital' },
        { status: 400 }
      );
    }

    // Check if the portfolio already exists
    const existingPortfolio = await db.query.portfolios.findFirst({
      where: and(
        eq(portfolios.teamId, userTeam.id),
        eq(portfolios.roundId, currentRound.id)
      ),
    });

    let portfolio;
    
    if (existingPortfolio) {
      // Update existing portfolio
      [portfolio] = await db
        .update(portfolios)
        .set({
          investmentS1: investments.s1,
          investmentS2: investments.s2,
          investmentS3: investments.s3,
          investmentS4: investments.s4,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(portfolios.teamId, userTeam.id),
            eq(portfolios.roundId, currentRound.id)
          )
        )
        .returning();
    } else {
      // Create new portfolio
      [portfolio] = await db
        .insert(portfolios)
        .values({
          teamId: userTeam.id,
          roundId: currentRound.id,
          capitalAtStart: userTeam.currentCapital,
          investmentS1: investments.s1,
          investmentS2: investments.s2,
          investmentS3: investments.s3,
          investmentS4: investments.s4,
          isSubmitted: true,
          submittedAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error submitting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to submit portfolio' },
      { status: 500 }
    );
  }
}
