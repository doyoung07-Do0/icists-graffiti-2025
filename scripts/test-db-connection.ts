import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test the connection by querying the database version
    const versionResult = await db.execute(sql`SELECT version() as version`);
    console.log('Database connection successful!');
    console.log('PostgreSQL Version:', versionResult[0]?.version || 'Unknown');
    
    // Check if the startup_returns table exists
    const tableCheck = await db.execute(
      sql`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      ) as exists`
    );
    
    const tableExists = tableCheck[0]?.exists || false;
    console.log('startup_returns table exists:', tableExists);
    
    if (!tableExists) {
      console.log('Creating startup_returns table...');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS startup_returns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          round_name VARCHAR(20) NOT NULL CHECK (round_name IN ('r1', 'r2', 'r3', 'r4')),
          s1_return INTEGER NOT NULL DEFAULT 0,
          s2_return INTEGER NOT NULL DEFAULT 0,
          s3_return INTEGER NOT NULL DEFAULT 0,
          s4_return INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(round_name)
        );
      `);
      console.log('Successfully created startup_returns table');
    }
    
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('\nTroubleshooting steps:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your DATABASE_URL in .env.local');
    console.log('3. Verify the database user has the correct permissions');
    console.log('4. Check if the database server is accessible from your network');
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testConnection();
