import { execSync } from 'child_process';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

// Set the database URL
export const DATABASE_URL = 'postgresql://postgres@localhost:5432/icists_graffiti?schema=public';

// Set the environment variable for the current process
process.env.DATABASE_URL = DATABASE_URL;

// Import the database client after setting the environment variable
import { db } from '@/lib/db';

async function setupDatabase() {
  try {
    console.log('Setting up the database...');
    
    // Test the database connection
    console.log('Testing database connection...');
    const result = await db.execute('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL Version:', result.rows[0]?.version || 'Unknown');
    
    // Check if the startup_returns table exists
    const tableCheck = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      )`
    );
    
    const tableExists = tableCheck.rows[0]?.exists || false;
    
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
      console.log('✅ Successfully created startup_returns table');
    } else {
      console.log('✅ startup_returns table already exists');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:');
    console.error(error);
    
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure PostgreSQL is running: brew services start postgresql@14');
    console.log('2. Create the database: createdb icists_graffiti');
    console.log('3. Check if the database is accessible: psql -d icists_graffiti -c "SELECT 1"');
    
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the setup
setupDatabase();
