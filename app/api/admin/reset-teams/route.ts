import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { team_r1, team_r2, team_r3, team_r4 } from '@/lib/db/schema';

// Helper function to generate team data for initialization
const generateTeamData = () => {
  return Array.from({ length: 16 }, (_, i) => ({
    team: `team${i + 1}`,
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
    pre_fund: 1000,
    post_fund: null,
    submitted: false,
  }));
};

export async function POST() {
  try {
    const teamData = generateTeamData();
    
    // Reset all team tables in a transaction
    await db.transaction(async (tx) => {
      // Clear existing data
      await tx.delete(team_r1).execute();
      await tx.delete(team_r2).execute();
      await tx.delete(team_r3).execute();
      await tx.delete(team_r4).execute();
      
      // Insert fresh data
      await tx.insert(team_r1).values(teamData).execute();
      await tx.insert(team_r2).values(teamData).execute();
      await tx.insert(team_r3).values(teamData).execute();
      await tx.insert(team_r4).values(teamData).execute();
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully reset all team data!',
    });
  } catch (error) {
    console.error('Failed to reset team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset team data' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
