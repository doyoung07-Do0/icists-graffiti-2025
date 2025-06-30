import { db } from '@/lib/db';
import { startupReturns } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Fetching returns from database...');
    
    // Query the database for all returns, ordered by creation date
    const result = await db.query.startupReturns.findMany({
      orderBy: [desc(startupReturns.createdAt)]
    });
    
    console.log('Successfully fetched returns:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in GET /api/returns:', error);
    
    // Return a proper error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch returns',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { roundName } = await request.json();
    
    if (!['r1', 'r2', 'r3', 'r4'].includes(roundName)) {
      return NextResponse.json(
        { error: 'Invalid round name' },
        { status: 400 }
      );
    }

    // Check if returns already exist for this round
    const existing = await db.query.startupReturns.findFirst({
      where: eq(startupReturns.roundName, roundName),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Returns already generated for this round' },
        { status: 400 }
      );
    }

    // Generate random returns between -50% and +100%
    const generateRandomReturn = () => {
      // Generate a number between -50 and 100
      const min = -50;
      const max = 100;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const newReturns = {
      roundName: roundName as 'r1' | 'r2' | 'r3' | 'r4',
      s1_return: generateRandomReturn(),
      s2_return: generateRandomReturn(),
      s3_return: generateRandomReturn(),
      s4_return: generateRandomReturn(),
    } as const;

    const [result] = await db
      .insert(startupReturns)
      .values(newReturns)
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating returns:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate returns',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundName = searchParams.get('round');
    
    if (roundName) {
      // Delete a specific round
      const result = await db
        .delete(startupReturns)
        .where(eq(startupReturns.roundName, roundName as 'r1' | 'r2' | 'r3' | 'r4'))
        .returning();
      
      return NextResponse.json({
        success: true,
        message: `Successfully deleted returns for round ${roundName}`,
        data: result
      });
    } else {
      // Delete all rounds
      const result = await db
        .delete(startupReturns)
        .returning();
      
      return NextResponse.json({
        success: true,
        message: 'Successfully deleted all returns',
        data: result
      });
    }
  } catch (error) {
    console.error('Error deleting returns:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete returns',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
