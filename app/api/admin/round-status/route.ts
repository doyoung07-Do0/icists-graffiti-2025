import { NextResponse } from 'next/server';
import { getRoundStatus } from '@/lib/db/queries/admin';

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

export const dynamic = 'force-dynamic';
