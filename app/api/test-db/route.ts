import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection
    const versionResult = await db.execute('SELECT version()');
    const version = Array.isArray(versionResult) && versionResult[0] ? versionResult[0].version : 'Unknown';
    
    // Check if the startup_returns table exists
    const tableCheck = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      ) as exists`
    );
    
    const tableExists = Array.isArray(tableCheck) && tableCheck[0] ? tableCheck[0].exists : false;
    
    return NextResponse.json({
      success: true,
      database: 'Connected',
      postgresVersion: version,
      startupReturnsTableExists: tableExists,
      tables: await getTableList()
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        env: {
          databaseUrl: process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set',
          nodeEnv: process.env.NODE_ENV,
          nextAuthUrl: process.env.NEXTAUTH_URL,
          nextAuthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'
        }
      },
      { status: 500 }
    );
  }
}

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
