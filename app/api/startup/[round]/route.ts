import { NextResponse } from 'next/server';
import { getStartupData } from '@/lib/db/queries/admin';

type Round = 'r1' | 'r2' | 'r3' | 'r4';

// Helper to validate round parameter
function isValidRound(round: string): round is Round {
  return ['r1', 'r2', 'r3', 'r4'].includes(round);
}

// Handle GET request
export async function GET(
  request: Request,
  { params }: { params: Promise<{ round: string }> }
) {
  try {
    const { round } = await params;
    
    // Validate round parameter
    if (!isValidRound(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round parameter' },
        { status: 400 }
      );
    }
    
    // Get startup data for the specified round
    const startupData = await getStartupData(round);
    
    return NextResponse.json({ success: true, data: startupData });
  } catch (error) {
    console.error('Error fetching startup data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch startup data' },
      { status: 500 }
    );
  }
}

// Ensure the route is not statically generated
export const dynamic = 'force-dynamic';
