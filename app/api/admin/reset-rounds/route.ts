import { NextResponse } from 'next/server';
import { resetRoundState } from '@/lib/db/queries';

export async function POST() {
  try {
    const result = await resetRoundState();
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully reset all rounds to initial state!',
      data: result 
    });
  } catch (error) {
    console.error('Failed to reset rounds:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset rounds' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
