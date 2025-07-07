import { NextResponse } from 'next/server';
import { getTeamData, updateTeamData } from '@/lib/db/queries/admin';

// Import the sendTeamUpdate function from the correct path
import { sendTeamUpdate } from '@/lib/sse';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Handle GET request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ round: string; team: string }> }
) {
  try {
    const { round, team } = await params;
    
    // Validate round parameter
    if (!isValidRound(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }
    
    // Validate team parameter
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team parameter is required' },
        { status: 400 }
      );
    }
    
    // Get team data for the specified round
    const teamData = await getTeamData(round, team);
    
    if (!teamData) {
      return NextResponse.json(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: teamData });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}

// Handle POST request for updating team data
export async function POST(
  request: Request,
  { params }: { params: Promise<{ round: string; team: string }> }
) {
  try {
    // Await params before destructuring
    const { round, team } = await Promise.resolve(params);
    
    // Validate round parameter
    if (!isValidRound(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }
    
    // Validate team parameter
    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Team parameter is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.s1 && data.s1 !== 0 || 
        !data.s2 && data.s2 !== 0 || 
        !data.s3 && data.s3 !== 0 || 
        !data.s4 && data.s4 !== 0) {
      return NextResponse.json(
        { success: false, error: 'All startup allocations (s1-s4) are required' },
        { status: 400 }
      );
    }
    
    // Update team data
    const result = await updateTeamData(round, team, {
      s1: Number(data.s1),
      s2: Number(data.s2),
      s3: Number(data.s3),
      s4: Number(data.s4),
      submitted: true, // Mark as submitted when updating
    });

    // Broadcast the update to all connected admin dashboards
    if (result) {
      try {
        console.log(`[${new Date().toISOString()}] Preparing to broadcast update for team ${team}, round ${round}`);
        // Import dynamically to avoid circular dependencies
        const { sendTeamUpdate } = await import('@/lib/sse');
        console.log(`[${new Date().toISOString()}] Sending update to SSE clients`);
        sendTeamUpdate(team, round, {
          type: 'team_updated',
          team: team,
          round: round,
          data: result,
          timestamp: new Date().toISOString()
        });
        console.log(`[${new Date().toISOString()}] Update broadcast completed`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error broadcasting team update:`, error);
      }
    } else {
      console.error(`[${new Date().toISOString()}] No result to broadcast for team ${team}, round ${round}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'Portfolio submitted successfully' 
    });
  } catch (error) {
    console.error('Error updating team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team data' },
      { status: 500 }
    );
  }
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
