import { NextResponse } from 'next/server';
import { db } from '@/lib/db/queries';
import { investmentRound } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST: Initialize investment rounds if they don't exist
export async function POST() {
  try {
    const rounds = ['Pre-seed', 'Seed', 'Series A', 'Series B'];
    
    for (const roundName of rounds) {
      // Check if round exists
      const existing = await db
        .select()
        .from(investmentRound)
        .where(eq(investmentRound.name, roundName))
        .limit(1);
      
      if (existing.length === 0) {
        // Create the round
        await db.insert(investmentRound).values({
          name: roundName,
          isActive: roundName === 'Pre-seed', // Make Pre-seed active by default
        });
      }
    }
    
    return NextResponse.json({ success: true, message: 'Investment rounds initialized' });
  } catch (error) {
    console.error('Error initializing investment rounds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
