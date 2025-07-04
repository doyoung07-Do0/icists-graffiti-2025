import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { toggleTeamSubmission, updateTeamData } from '@/lib/db/queries/admin';

// Helper function to validate round parameter
function isValidRound(round: string): round is 'r1' | 'r2' | 'r3' | 'r4' {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Handle GET request
export async function GET(request: Request) {
  try {
    // Extract roundId from URL
    const url = new URL(request.url);
    const roundMatch = url.pathname.match(/\/api\/admin\/teams-v2\/([^/]+)/);
    const roundId = roundMatch ? roundMatch[1] : '';
    
    if (!isValidRound(roundId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, you would fetch the teams data here
    return NextResponse.json({ 
      success: true, 
      data: {},
      metadata: {
        message: 'GET handler for teams-v2',
        round: roundId,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in teams-v2 GET handler:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process request'
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle POST request
export async function POST(request: Request) {
  try {
    console.log('=== TEAMS-V2 API POST REQUEST ===');
    console.log('URL:', request.url);
    console.log('Method:', request.method);
    
    // Extract roundId from URL
    const url = new URL(request.url);
    const roundMatch = url.pathname.match(/\/api\/admin\/teams-v2\/([^/]+)/);
    const roundId = roundMatch ? roundMatch[1] : '';
    console.log('Round from URL:', roundId);
    
    // Validate round parameter
    if (!isValidRound(roundId)) {
      const errorMsg = `Invalid round parameter: ${roundId}. Must be one of: ${['r1', 'r2', 'r3', 'r4'].join(', ')}`;
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

      console.log(`Toggling submission for team ${team} in round ${roundId} to ${!data.currentStatus}`);
      const result = await toggleTeamSubmission(roundId, team, data.currentStatus);
      return NextResponse.json(
        { 
          success: true, 
          data: result,
          metadata: {
            action: 'toggle-submission',
            round: roundId,
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

      console.log(`Updating team ${team} in round ${roundId} with data:`, data);
      const result = await updateTeamData(roundId, team, data);
      return NextResponse.json(
        { 
          success: true, 
          data: result,
          metadata: {
            action: 'update',
            round: roundId,
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
    console.error('Error in teams-v2 API:', error);
    
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
