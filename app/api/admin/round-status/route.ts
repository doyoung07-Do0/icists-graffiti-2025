import { NextResponse } from 'next/server';
import { getRoundStatus, updateRoundStatus } from '@/lib/db/queries/admin';
import { z } from 'zod';
import { broadcastRoundStatusUpdate } from '@/app/api/teams/events/route';

export async function GET() {
  try {
    const status = await getRoundStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('Error fetching round status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch round status' },
      { status: 500 }
    );
  }
}

// Schema for request validation
const updateRoundStatusSchema = z.object({
  round: z.enum(['r1', 'r2', 'r3', 'r4']),
  status: z.enum(['locked', 'open', 'closed'])
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = updateRoundStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { round, status } = validation.data;
    
    // Update the round status in the database
    await updateRoundStatus(round, status);
    
    // Broadcast the update to all connected clients
    try {
      await broadcastRoundStatusUpdate(round, status);
      console.log(`Successfully broadcasted round status update: ${round} -> ${status}`);
    } catch (broadcastError) {
      console.error('Error broadcasting round status update:', broadcastError);
      // Don't fail the request if broadcasting fails, just log the error
    }
    
    // Return the updated status
    const updatedStatus = await getRoundStatus();
    return NextResponse.json({ 
      success: true, 
      data: updatedStatus 
    });
  } catch (error) {
    console.error('Error updating round status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update round status' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
