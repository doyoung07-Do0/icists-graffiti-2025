import { NextResponse } from 'next/server';
import { getTeamData } from '@/lib/db/queries/admin';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Validate team parameter
function isValidTeam(team: string): boolean {
  return (
    /^team\d{1,2}$/.test(team) &&
    Number.parseInt(team.replace('team', ''), 10) >= 1 &&
    Number.parseInt(team.replace('team', ''), 10) <= 16
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ round: string; team: string }> },
) {
  try {
    const { round, team } = await params;

    // Validate round parameter
    if (!isValidRound(round)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid round parameter. Must be r1, r2, r3, or r4.',
        },
        { status: 400 },
      );
    }

    // Validate team parameter
    if (!isValidTeam(team)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid team parameter. Must be team1-team16.',
        },
        { status: 400 },
      );
    }

    // Get current team data
    const teamData = await getTeamData(round, team);

    if (!teamData) {
      return NextResponse.json(
        { success: false, error: 'Team not found in this round' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        team,
        round,
        submitted: teamData.submitted,
        teamData,
      },
    });
  } catch (error) {
    console.error('Error fetching team submission status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team submission status' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
