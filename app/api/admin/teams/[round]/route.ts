import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import {
  getTeamsForRound,
  updateTeamData,
  toggleTeamSubmission,
} from '@/lib/db/queries/admin';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Handle GET request
export async function GET(request: Request) {
  try {
    // Extract round from URL
    const url = new URL(request.url);
    const roundMatch = url.pathname.match(/\/api\/admin\/teams\/([^/]+)/);
    const round = roundMatch ? roundMatch[1] : '';

    // Validate round parameter
    if (!isValidRound(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 },
      );
    }

    const teams = await getTeamsForRound(round);
    return NextResponse.json({ success: true, data: teams });
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team data' },
      { status: 500 },
    );
  }
}

// Handle POST request
export async function POST(request: Request) {
  try {
    // Extract round from URL
    const url = new URL(request.url);
    const roundMatch = url.pathname.match(/\/api\/admin\/teams\/([^/]+)/);
    const round = roundMatch ? roundMatch[1] : '';

    // Validate round parameter
    if (!isValidRound(round)) {
      const errorMsg = `Invalid round parameter: ${round}. Must be one of: ${['r1', 'r2', 'r3', 'r4'].join(', ')}`;
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { team, data, action } = body;

    // Validate required fields
    if (!action) {
      const errorMsg = 'Missing required field: action';
      console.error(errorMsg);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Handle different actions
    if (action === 'toggle-submission') {
      if (!team || data?.currentStatus === undefined) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Missing required fields for toggle-submission: team and data.currentStatus are required',
          },
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }

      console.log(
        `Toggling submission for team ${team} in round ${round} to ${!data.currentStatus}`,
      );
      const result = await toggleTeamSubmission(
        round,
        team,
        data.currentStatus,
      );

      // Broadcast the toggle submission to the team
      if (result) {
        try {
          console.log(
            `[${new Date().toISOString()}] Broadcasting toggle submission: ${team} ${!data.currentStatus ? 'submitted' : 'unsubmitted'} for round ${round}`,
          );

          // Import the SSE broadcasting function
          const { sendTeamUpdate } = await import('@/lib/sse');

          // Send update to the specific team
          sendTeamUpdate(team, round, {
            type: 'submission_toggled',
            team: team,
            round: round,
            submitted: !data.currentStatus,
            timestamp: new Date().toISOString(),
          });

          console.log(
            `[${new Date().toISOString()}] Toggle submission broadcast completed`,
          );
        } catch (error) {
          console.error(
            `[${new Date().toISOString()}] Error broadcasting toggle submission:`,
            error,
          );
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: result,
          metadata: {
            action: 'toggle-submission',
            round,
            team,
            newStatus: !data.currentStatus,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (action === 'mark-all-submitted') {
      console.log(`Marking all teams as submitted for round ${round}`);

      // Import the SSE broadcasting function
      const { sendTeamUpdate } = await import('@/lib/sse');

      // Get all teams for this round
      const teams = await getTeamsForRound(round);

      // Update all teams to submitted status
      const updatePromises = teams.map(async (teamData) => {
        const result = await toggleTeamSubmission(round, teamData.team, false); // false means set to true

        // Broadcast to each team
        if (result) {
          try {
            console.log(
              `[${new Date().toISOString()}] Broadcasting mark-all-submitted: ${teamData.team} submitted for round ${round}`,
            );

            sendTeamUpdate(teamData.team, round, {
              type: 'submission_toggled',
              team: teamData.team,
              round: round,
              submitted: true,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error(
              `[${new Date().toISOString()}] Error broadcasting to ${teamData.team}:`,
              error,
            );
          }
        }

        return { team: teamData.team, success: !!result };
      });

      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter((r) => r.success);
      const failedUpdates = results.filter((r) => !r.success);

      console.log(
        `[${new Date().toISOString()}] Mark all submitted completed: ${successfulUpdates.length} successful, ${failedUpdates.length} failed`,
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            totalTeams: teams.length,
            successfulUpdates: successfulUpdates.length,
            failedUpdates: failedUpdates.length,
            results: results,
          },
          metadata: {
            action: 'mark-all-submitted',
            round,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (action === 'update') {
      if (!team || !data) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Missing required fields for update: team and data are required',
          },
          { status: 400, headers: { 'Content-Type': 'application/json' } },
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
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Unknown action
    return NextResponse.json(
      {
        success: false,
        error: `Unknown action: ${action}. Supported actions: toggle-submission, mark-all-submitted, update`,
        supportedActions: ['toggle-submission', 'mark-all-submitted', 'update'],
      },
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request',
      },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
