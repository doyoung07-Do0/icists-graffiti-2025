import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

interface TeamResult {
  team: string;
  post_fund: number | null;
  rank?: number;
}

export async function GET() {
  try {
    // Fetch all teams' post_fund values from team_r4
    const teams = await db.execute(sql`
      SELECT team, post_fund 
      FROM team_r4 
      WHERE post_fund IS NOT NULL
      ORDER BY post_fund DESC
    `) as unknown as TeamResult[];

    // Add ranking
    const rankedTeams: TeamResult[] = teams.map((team, index) => ({
      ...team,
      rank: index + 1,
    }));

    return NextResponse.json({ success: true, data: rankedTeams });
  } catch (error) {
    console.error('Unexpected error in final results API:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
