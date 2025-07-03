import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getTeamsForRound, updateTeamData, toggleTeamSubmission } from '@/lib/db/queries/admin';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Handle GET request
export async function GET(
  request: NextRequest,
  { params }: { params: { round: string } }
) {
  try {
    // Ensure params is properly awaited
    const { round } = await Promise.resolve(params);
    
    // Validate round parameter
    if (!isValidRound(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }
    
    const teams = await getTeamsForRound(round);
    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team data' },
      { status: 500 }
    );
  }
}

// Handle POST request
export async function POST(
  request: NextRequest,
  { params }: { params: { round: string } }
) {
  try {
    // Log the incoming request
    console.log('=== TEAMS API POST REQUEST ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    // Ensure params is properly awaited
    const { round } = await Promise.resolve(params);
    console.log('Round from params:', round);
    
    // Validate round parameter
    if (!isValidRound(round)) {
      const errorMsg = `Invalid round parameter: ${round}. Must be one of: ${['r1', 'r2', 'r3', 'r4'].join(', ')}`;
      console.error(errorMsg);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (error) {
      const errorMsg = 'Invalid JSON payload';
      console.error(errorMsg, error);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { team, data, action } = body;

    // Validate required fields
    if (!action) {
      const errorMsg = 'Missing required field: action';
      console.error(errorMsg);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle different actions
    if (action === 'toggle-submission') {
      if (!team || data?.currentStatus === undefined) {
        const errorMsg = 'Missing required fields for toggle-submission: team and data.currentStatus are required';
        console.error(errorMsg);
        return NextResponse.json(
          { success: false, error: errorMsg },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Toggling submission for team ${team} in round ${round} to ${!data.currentStatus}`);
      const result = await toggleTeamSubmission(round, team, data.currentStatus);
      return NextResponse.json(
        { 
          success: true, 
          data: result,
          metadata: {
            action: 'toggle-submission',
            round,
            team,
            newStatus: !data.currentStatus,
            timestamp: new Date().toISOString()
          }
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      if (!team || !data) {
        const errorMsg = 'Missing required fields for update: team and data are required';
        console.error(errorMsg);
        return NextResponse.json(
          { success: false, error: errorMsg },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Updating team ${team} in round ${round} with data:`, data);
      const result = await updateTeamData(round, team, data);
      return NextResponse.json(
        { 
          success: true, 
          data: result,
          metadata: {
            action: 'update',
            round,
            team,
            timestamp: new Date().toISOString()
          }
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Unknown action
    const errorMsg = `Unknown action: ${action}. Supported actions: toggle-submission, update`;
    console.error(errorMsg);
    return NextResponse.json(
      { 
        success: false, 
        error: errorMsg,
        supportedActions: ['toggle-submission', 'update']
      },
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in teams API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMsg,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
          message: error instanceof Error ? error.message : undefined
        })
      },
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
