import { NextResponse } from 'next/server';
import { openNewRound } from '@/lib/db/queries/admin';

export async function POST(request: Request) {
  try {
    const { round } = await request.json();

    if (!['r2', 'r3', 'r4'].includes(round)) {
      return NextResponse.json(
        { error: 'Invalid round. Must be r2, r3, or r4' },
        { status: 400 },
      );
    }

    await openNewRound(round as 'r2' | 'r3' | 'r4');

    // Broadcast round status update to all teams
    try {
      console.log(
        `[${new Date().toISOString()}] Broadcasting round opened: ${round}`,
      );

      // Import the SSE broadcasting function
      const { broadcastRoundStatusUpdate } = await import('@/lib/sse');

      // Broadcast to all connected clients
      const sentCount = broadcastRoundStatusUpdate(round, 'open');

      console.log(
        `[${new Date().toISOString()}] Round opened broadcast completed. Sent to ${sentCount} clients.`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error broadcasting round opened:`,
        error,
      );
      // Don't fail the request if broadcasting fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error opening round:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to open round',
      },
      { status: 500 },
    );
  }
}
