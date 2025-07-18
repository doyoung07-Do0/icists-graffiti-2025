import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { team_r1, team_r2, team_r3, team_r4 } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper function to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentRound = searchParams.get('currentRound') as Round;

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

    // Fetch data for all teams efficiently - one query per round instead of 15 queries per round
    const allTeamsData = [];

    // Initialize data structure for all teams
    for (let teamNumber = 1; teamNumber <= 15; teamNumber++) {
      const team = `team${teamNumber}`;
      allTeamsData.push({
        team,
        s1: 0,
        s2: 0,
        s3: 0,
        s4: 0,
        s5: 0,
        postFund: 0,
        total: 0,
      });
    }

    // Fetch all teams' data for each round in single queries (much more efficient)
    for (const round of roundsToFetch) {
      const table = getTeamTable(round);
      const allTeamsResult = await db.select().from(table);

      // Process all teams' data for this round
      for (const teamData of allTeamsResult) {
        const teamIndex = allTeamsData.findIndex(
          (t) => t.team === teamData.team,
        );
        if (teamIndex !== -1) {
          const team = allTeamsData[teamIndex];
          // Add the investment amounts to cumulative totals
          team.s1 += teamData.s1 || 0;
          team.s2 += teamData.s2 || 0;
          team.s3 += teamData.s3 || 0;
          team.s4 += teamData.s4 || 0;
          team.s5 += teamData.s5 || 0;

          // Store post_fund for current round (for ranking)
          if (round === currentRound) {
            team.postFund = teamData.post_fund || 0;
          }
        }
      }
    }

    // Calculate total investment for each team
    for (const team of allTeamsData) {
      team.total = team.s1 + team.s2 + team.s3 + team.s4 + team.s5;
    }

    // Sort teams by post_fund value in descending order (highest first)
    allTeamsData.sort((a, b) => b.postFund - a.postFund);

    // Add rank to each team
    const rankedTeams = allTeamsData.map((team, index) => ({
      ...team,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentRound,
        teams: rankedTeams,
      },
    });
  } catch (error) {
    console.error('Error fetching cumulative team rankings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cumulative team rankings' },
      { status: 500 },
    );
  }
}
