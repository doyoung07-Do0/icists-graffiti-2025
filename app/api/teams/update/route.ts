import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { team1, team2, team3, team4, team5, team6, team7, team8, team9, team10, team11, team12, team13, team14, team15, team16 } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

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

interface TeamUpdateData {
  teamNumber: TeamNumber;
  roundName: 'r1' | 'r2' | 'r3' | 'r4';
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  remain: number;
  total: number;
}

export async function POST(request: Request) {
  try {
    const updates: TeamUpdateData[] = await request.json();

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Process each update
    const results = await Promise.allSettled(
      updates.map(async (update) => {
        const { teamNumber, roundName, ...data } = update;
        
        // Validate team number
        if (!(teamNumber in TEAM_TABLES)) {
          throw new Error(`Invalid team number: ${teamNumber}`);
        }

        // Get the team table
        const teamTable = TEAM_TABLES[teamNumber as TeamNumber];
        
        // Update or insert the record
        const result = await db
          .insert(teamTable)
          .values({
            roundName,
            ...data,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: teamTable.roundName, // Assuming roundName is unique per table
            set: {
              ...data,
              updatedAt: new Date(),
            },
          })
          .returning();

        return {
          teamNumber,
          roundName,
          success: true,
          data: result[0],
        };
      })
    );

    // Check for any failed updates
    const failedUpdates = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (failedUpdates.length > 0) {
      console.error('Failed updates:', failedUpdates);
      return NextResponse.json(
        {
          success: false,
          message: 'Some updates failed',
          failedCount: failedUpdates.length,
          errors: failedUpdates.map((f) => f.reason?.message || 'Unknown error'),
        },
        { status: 207 } // 207 Multi-Status
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Updates completed successfully',
      updatedCount: results.length,
    });
  } catch (error) {
    console.error('Error updating team data:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
