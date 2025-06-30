import { db } from '@/lib/db';
import { startupReturns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Fetching returns from database...');
    
    // First, check if the table exists using direct SQL
    const tableCheck = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      ) as exists`
    );
    
    const tableExists = tableCheck[0]?.exists || false;
    console.log('Table exists:', tableExists);
    
    if (!tableExists) {
      const tables = await getTableList();
      return NextResponse.json(
        { 
          error: 'Table not found',
          details: 'The startup_returns table does not exist in the database',
          tables: tables
        },
        { status: 500 }
      );
    }
    
    // If table exists, try to query it directly with SQL
    console.log('Querying startup_returns table with direct SQL...');
    const result = await db.execute(
      `SELECT id, 
              round_name as "roundName", 
              s1_return as "s1Return", 
              s2_return as "s2Return", 
              s3_return as "s3Return", 
              s4_return as "s4Return", 
              created_at as "createdAt" 
       FROM startup_returns 
       ORDER BY created_at DESC`
    );
    
    console.log('Successfully fetched returns:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in GET /api/returns:', error);
    
    // Get more details about the error
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'UnknownError',
      stack: error instanceof Error ? error.stack : undefined,
      raw: String(error)
    };
    
    console.error('Error details:', errorDetails);
    
    try {
      const tables = await getTableList();
      return NextResponse.json(
        { 
          error: 'Failed to fetch returns',
          details: errorDetails,
          tables: tables
        },
        { status: 500 }
      );
    } catch (e) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch returns',
          details: errorDetails,
          tables: []
        },
        { status: 500 }
      );
    }
  }
}

// Helper function to get list of all tables
async function getTableList() {
  try {
    const tables = await db.execute(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    
    return Array.isArray(tables) ? tables.map(t => t.table_name) : [];
  } catch (error) {
    console.error('Error fetching table list:', error);
    return [];
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
      roundName,
      s1_return: generateRandomReturn(),
      s2_return: generateRandomReturn(),
      s3_return: generateRandomReturn(),
      s4_return: generateRandomReturn(),
    };

    const [result] = await db
      .insert(startupReturns)
      .values(newReturns)
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating returns:', error);
    return NextResponse.json(
      { error: 'Failed to generate returns' },
      { status: 500 }
    );
  }
}
