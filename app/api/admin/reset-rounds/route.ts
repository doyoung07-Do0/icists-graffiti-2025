import { NextResponse } from 'next/server';
import { resetRoundState } from '@/lib/db/queries';

export async function POST() {
  try {
    const result = await resetRoundState();

    // Broadcast reset message to all teams
    try {
      console.log(
        `[${new Date().toISOString()}] Broadcasting reset all rounds`,
      );

      // Import the SSE broadcasting function
      const { broadcastRoundStatusUpdate } = await import('@/lib/sse');

      // Broadcast to all rounds (r1, r2, r3, r4) that they are now locked
      const rounds = ['r1', 'r2', 'r3', 'r4'] as const;
      let totalSent = 0;

      for (const round of rounds) {
        const sentCount = broadcastRoundStatusUpdate(round, 'locked');
        totalSent += sentCount;
      }

      console.log(
        `[${new Date().toISOString()}] Reset rounds broadcast completed. Sent to ${totalSent} clients total.`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error broadcasting reset rounds:`,
        error,
      );
      // Don't fail the request if broadcasting fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully reset all rounds to initial state!',
      data: result,
    });
  } catch (error) {
    console.error('Failed to reset rounds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset rounds' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
