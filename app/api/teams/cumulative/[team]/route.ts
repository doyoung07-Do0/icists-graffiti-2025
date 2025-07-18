import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { team_r1, team_r2, team_r3, team_r4 } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper function to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Helper function to validate team parameter
function isValidTeam(team: string): boolean {
  return /^team(1[0-5]|[1-9])$/.test(team);
}

// Helper function to get team table for a round
function getTeamTable(round: Round) {
  switch (round) {
    case 'r1':
      return team_r1;
    case 'r2':
      return team_r2;
    case 'r3':
      return team_r3;
    case 'r4':
      return team_r4;
    default:
      throw new Error(`Invalid round: ${round}`);
  }
}

// Handle GET request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ team: string }> },
) {
  try {
    const { team } = await params;
    const { searchParams } = new URL(request.url);
    const currentRound = searchParams.get('currentRound') as Round;

    // Validate team parameter
    if (!isValidTeam(team)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid team parameter. Must be team1-team15.',
        },
        { status: 400 },
      );
    }

    // Validate current round parameter
    if (!currentRound || !isValidRound(currentRound)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid currentRound parameter. Must be r1, r2, r3, or r4.',
        },
        { status: 400 },
      );
    }

    // Determine which rounds to fetch based on current round
    const roundsToFetch: Round[] = [];
    switch (currentRound) {
      case 'r1':
        roundsToFetch.push('r1');
        break;
      case 'r2':
        roundsToFetch.push('r1', 'r2');
        break;
      case 'r3':
        roundsToFetch.push('r1', 'r2', 'r3');
        break;
      case 'r4':
        roundsToFetch.push('r1', 'r2', 'r3', 'r4');
        break;
    }

    // Fetch team data for all relevant rounds
    const cumulativeData = {
      s1: 0,
      s2: 0,
      s3: 0,
      s4: 0,
      s5: 0,
    };

    let currentRoundPreFund = 0; // Store pre_fund for current round

    for (const round of roundsToFetch) {
      const table = getTeamTable(round);
      const result = await db.select().from(table).where(eq(table.team, team));

      if (result.length > 0) {
        const teamData = result[0];
        // Add the pre_fund values (which represent the investment amounts) to cumulative totals
        cumulativeData.s1 += teamData.s1 || 0;
        cumulativeData.s2 += teamData.s2 || 0;
        cumulativeData.s3 += teamData.s3 || 0;
        cumulativeData.s4 += teamData.s4 || 0;
        cumulativeData.s5 += teamData.s5 || 0;

        // Store pre_fund for current round
        if (round === currentRound) {
          currentRoundPreFund = teamData.pre_fund || 0;
        }
      }
    }

    // Calculate total
    const total =
      cumulativeData.s1 +
      cumulativeData.s2 +
      cumulativeData.s3 +
      cumulativeData.s4 +
      cumulativeData.s5;

    return NextResponse.json({
      success: true,
      data: {
        team,
        currentRound,
        ...cumulativeData,
        total,
        preFund: currentRoundPreFund, // Add pre_fund for current round
      },
    });
  } catch (error) {
    console.error('Error fetching cumulative team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cumulative team data' },
      { status: 500 },
    );
  }
}
