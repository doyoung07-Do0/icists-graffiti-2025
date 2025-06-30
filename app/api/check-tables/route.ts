import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check if the startup_returns table exists
    const result = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      ) as exists`
    );

    // The result is an array where each element is a row with the 'exists' property
    const tableExists = result[0]?.exists || false;

    return NextResponse.json({
      startup_returns_exists: tableExists,
      message: tableExists 
        ? 'startup_returns table exists' 
        : 'startup_returns table does not exist'
    });
  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json(
      { error: 'Failed to check tables', details: error },
      { status: 500 }
    );
  }
}
