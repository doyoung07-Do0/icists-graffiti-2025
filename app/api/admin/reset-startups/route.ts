import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  startup_r1,
  startup_r2,
  startup_r3,
  startup_r4,
} from '@/lib/db/schema';

// Helper function to generate startup data for initialization
const generateStartupData = () => {
  return (['s1', 's2', 's3', 's4', 's5'] as const).map((startup) => ({
    startup,
    pre_cap: null,
    yield: null,
    post_cap: null,
  }));
};

export async function POST() {
  try {
    const startupData = generateStartupData();

    // Reset all startup tables in a transaction
    await db.transaction(async (tx) => {
      // Clear existing data
      await tx.delete(startup_r1).execute();
      await tx.delete(startup_r2).execute();
      await tx.delete(startup_r3).execute();
      await tx.delete(startup_r4).execute();

      // Insert fresh data with NULL values
      await tx.insert(startup_r1).values(startupData).execute();
      await tx.insert(startup_r2).values(startupData).execute();
      await tx.insert(startup_r3).values(startupData).execute();
      await tx.insert(startup_r4).values(startupData).execute();
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully reset all startup data!',
    });
  } catch (error) {
    console.error('Failed to reset startup data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset startup data' },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
