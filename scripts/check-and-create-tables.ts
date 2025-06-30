import { db } from '@/lib/db';
import { startupReturns } from '@/lib/db/schema';

async function checkAndCreateTables() {
  try {
    console.log('Checking if startup_returns table exists...');
    
    // Check if the table exists
    const result = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      )`
    );

    const tableExists = result.rows[0]?.exists || false;
    
    if (tableExists) {
      console.log('startup_returns table already exists');
      return;
    }

    console.log('Creating startup_returns table...');
    
    // Create the table
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
  } catch (error) {
    console.error('Error checking/creating tables:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

checkAndCreateTables();
