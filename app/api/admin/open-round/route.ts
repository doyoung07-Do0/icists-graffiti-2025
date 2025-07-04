import { NextResponse } from 'next/server';
import { openNewRound } from '@/lib/db/queries/admin';

export async function POST(request: Request) {
  try {
    const { round } = await request.json();
    
    if (!['r2', 'r3', 'r4'].includes(round)) {
      return NextResponse.json(
        { error: 'Invalid round. Must be r2, r3, or r4' },
        { status: 400 }
      );
    }

    await openNewRound(round as 'r2' | 'r3' | 'r4');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error opening round:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to open round' },
      { status: 500 }
    );
  }
}
