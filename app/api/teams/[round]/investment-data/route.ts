import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { team_r1, team_r2, team_r3, team_r4 } from '@/lib/db/schema';
import type { Round } from '@/app/investment/play/components/admin/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ round: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const startup = searchParams.get('startup');
    const { round } = await params;
    const roundType = round as Round;

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup parameter is required' },
        { status: 400 },
      );
    }

    // Get the appropriate team table based on round
    let teamTable: typeof team_r1;
    switch (roundType) {
      case 'r1':
        teamTable = team_r1;
        break;
      case 'r2':
        teamTable = team_r2;
        break;
      case 'r3':
        teamTable = team_r3;
        break;
      case 'r4':
        teamTable = team_r4;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid round' },
          { status: 400 },
        );
    }

    // Get team investment data for the specified startup
    const teams = await db
      .select({
        team: teamTable.team,
        s1: teamTable.s1,
        s2: teamTable.s2,
        s3: teamTable.s3,
        s4: teamTable.s4,
        s5: teamTable.s5,
      })
      .from(teamTable);

    // Extract investment values for the specified startup
    const investmentData = teams.map((team, index) => {
      let investment = 0;
      switch (startup) {
        case 's1':
          investment = team.s1;
          break;
        case 's2':
          investment = team.s2;
          break;
        case 's3':
          investment = team.s3;
          break;
        case 's4':
          investment = team.s4;
          break;
        case 's5':
          investment = team.s5;
          break;
        default:
          investment = 0;
      }

      return {
        team: team.team,
        teamNumber: index + 1, // Team numbers are 1-based
        investment: investment,
      };
    });

    return NextResponse.json({
      success: true,
      data: investmentData,
    });
  } catch (error) {
    console.error('Error fetching team investment data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team investment data' },
      { status: 500 },
    );
  }
}
