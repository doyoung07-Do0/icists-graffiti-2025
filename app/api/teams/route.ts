import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { team1, team2, team3, team4, team5, team6, team7, team8, team9, team10, team11, team12, team13, team14, team15, team16 } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { notifyUpdate } from '@/lib/sse';

// Map team numbers to their respective tables
const TEAM_TABLES = {
  1: team1,
  2: team2,
  3: team3,
  4: team4,
  5: team5,
  6: team6,
  7: team7,
  8: team8,
  9: team9,
  10: team10,
  11: team11,
  12: team12,
  13: team13,
  14: team14,
  15: team15,
  16: team16,
} as const;

type TeamNumber = keyof typeof TEAM_TABLES;

interface TeamDataResponse {
  teamNumber: number;
  roundName: string;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  remain: number;
  total: number;
  updatedAt: string;
}

interface TeamPortfolioUpdate {
  teamNumber: number;
  round: 'r1' | 'r2' | 'r3' | 'r4';
  s1: number;
  s2: number;
  s3: number;
  s4: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundName = searchParams.get('round') as 'r1' | 'r2' | 'r3' | 'r4' | null;
    const teamNumber = searchParams.get('team') ? parseInt(searchParams.get('team') as string, 10) as TeamNumber : null;

    if (!roundName || !['r1', 'r2', 'r3', 'r4'].includes(roundName)) {
      return NextResponse.json(
        { error: 'Invalid or missing round parameter. Must be one of: r1, r2, r3, r4' },
        { status: 400 }
      );
    }

    // If team number is provided, only fetch data for that team
    if (teamNumber) {
      if (!(teamNumber in TEAM_TABLES)) {
        return NextResponse.json(
          { error: 'Invalid team number. Must be between 1 and 16' },
          { status: 400 }
        );
      }

      const teamTable = TEAM_TABLES[teamNumber];
      const result = await db
        .select()
        .from(teamTable)
        .where(eq(teamTable.roundName, roundName));

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'No data found for the specified team and round' },
          { status: 404 }
        );
      }

      return NextResponse.json([{
        teamNumber,
        ...result[0]
      }]);
    }

    // If no team number is provided, fetch data for all teams
    const allTeamData = await Promise.all(
      Object.entries(TEAM_TABLES).map(async ([teamNum, teamTable]) => {
        const result = await db
          .select()
          .from(teamTable)
          .where(eq(teamTable.roundName, roundName));
          
        return {
          teamNumber: parseInt(teamNum, 10) as TeamNumber,
          ...(result[0] || {
            roundName,
            s1: 0,
            s2: 0,
            s3: 0,
            s4: 0,
            remain: 0,
            total: 0,
            updatedAt: new Date().toISOString()
          })
        };
      })
    );

    return NextResponse.json(allTeamData);
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: TeamPortfolioUpdate = await request.json();
    const { teamNumber, round, s1, s2, s3, s4 } = body;

    // Validate team number
    if (!teamNumber || !(teamNumber in TEAM_TABLES)) {
      return NextResponse.json(
        { error: 'Invalid team number. Must be between 1 and 16' },
        { status: 400 }
      );
    }

    // Validate round
    if (!['r1', 'r2', 'r3', 'r4'].includes(round)) {
      return NextResponse.json(
        { error: 'Invalid round. Must be one of: r1, r2, r3, r4' },
        { status: 400 }
      );
    }

    // Validate investment amounts (must be non-negative)
    if ([s1, s2, s3, s4].some(amt => amt < 0)) {
      return NextResponse.json(
        { error: 'Investment amounts cannot be negative' },
        { status: 400 }
      );
    }

    const teamTable = TEAM_TABLES[teamNumber as TeamNumber];
    const total = s1 + s2 + s3 + s4;
    const now = new Date();

    // Check if a record already exists for this team and round
    const existingRecord = await db
      .select()
      .from(teamTable)
      .where(eq(teamTable.roundName, round))
      .limit(1);

    if (existingRecord.length > 0) {
      // Update existing record
      await db
        .update(teamTable)
        .set({
          s1,
          s2,
          s3,
          s4,
          remain: existingRecord[0].total - total,
          updatedAt: now,
        })
        .where(eq(teamTable.id, existingRecord[0].id));
    } else {
      // Create new record
      await db.insert(teamTable).values({
        roundName: round,
        s1,
        s2,
        s3,
        s4,
        remain: 0, // Will be set in the database trigger
        total: 0,  // Will be set in the database trigger
        updatedAt: now,
      });
    }

    // Return the updated data
    const updatedRecord = await db
      .select()
      .from(teamTable)
      .where(eq(teamTable.roundName, round));

    // Notify all connected clients of the update
    notifyUpdate();

    return NextResponse.json({
      success: true,
      data: {
        teamNumber,
        ...(updatedRecord[0] || {})
      }
    });

  } catch (error) {
    console.error('Error updating team portfolio:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update portfolio',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
