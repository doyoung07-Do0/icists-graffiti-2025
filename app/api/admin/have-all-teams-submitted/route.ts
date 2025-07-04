import { NextResponse } from 'next/server';
import { haveAllTeamsSubmitted } from '@/lib/db/queries/admin';
import { z } from 'zod';

// Schema for request validation
const querySchema = z.object({
  round: z.enum(['r1', 'r2', 'r3', 'r4'])
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const round = searchParams.get('round');
    
    // Validate the round parameter
    const validation = querySchema.safeParse({ round });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }

    const { round: validatedRound } = validation.data;
    
    // Check if all teams have submitted
    const allSubmitted = await haveAllTeamsSubmitted(validatedRound);
    
    return NextResponse.json({ 
      success: true, 
      allSubmitted 
    });
  } catch (error) {
    console.error('Error checking team submissions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check team submissions',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
