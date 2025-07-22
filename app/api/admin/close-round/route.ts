import { NextResponse } from 'next/server';
import {
  calculateAndUpdateStartupData,
  haveAllTeamsSubmitted,
  updateRoundStatus,
} from '@/lib/db/queries/admin';
import { z } from 'zod';

// Schema for request validation
const closeRoundSchema = z.object({
  round: z.enum(['r1', 'r2', 'r3', 'r4']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = closeRoundSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 },
      );
    }

    const { round } = validation.data;

    // Check if all teams have submitted
    const allSubmitted = await haveAllTeamsSubmitted(round);
    if (!allSubmitted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not all teams have submitted their portfolio',
        },
        { status: 400 },
      );
    }

    // Calculate and update startup data
    await calculateAndUpdateStartupData(round);
    console.log('Startup data updated');

    // Update round status to 'closed'
    await updateRoundStatus(round, 'closed');
    console.log('Round status updated');

    // Broadcast round status update to all teams
    try {
      console.log(
        `[${new Date().toISOString()}] Broadcasting round closed: ${round}`,
      );

      // Import the SSE broadcasting function
      const { broadcastRoundStatusUpdate } = await import('@/lib/sse');

      // Broadcast to all connected clients
      const sentCount = broadcastRoundStatusUpdate(round, 'closed');

      console.log(
        `[${new Date().toISOString()}] Round closed broadcast completed. Sent to ${sentCount} clients.`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error broadcasting round closed:`,
        error,
      );
      // Don't fail the request if broadcasting fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully closed ${round} and updated startup data`,
    });
  } catch (error) {
    console.error('Error closing round:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to close the round',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
