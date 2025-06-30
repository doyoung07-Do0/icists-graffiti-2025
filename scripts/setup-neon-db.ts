import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { join } from 'path';
import * as schema from '../lib/db/schema';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

// Use the DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function setupDatabase() {
  try {
    console.log('Connecting to Neon database...');
    
    // Check if the table already exists
    const tableCheck = await client`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      ) as exists
    `;
    
    if (tableCheck[0]?.exists) {
      console.log('Table startup_returns already exists in the database.');
      return;
    }
    
    console.log('Creating startup_returns table...');
    
    // Create the table
    await client`
      CREATE TABLE IF NOT EXISTS public.startup_returns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        round_name VARCHAR(20) NOT NULL 
          CHECK (round_name IN ('r1', 'r2', 'r3', 'r4')),
        s1_return INTEGER NOT NULL DEFAULT 0,
        s2_return INTEGER NOT NULL DEFAULT 0,
        s3_return INTEGER NOT NULL DEFAULT 0,
        s4_return INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT startup_returns_round_name_key UNIQUE (round_name)
      );
    `;
    
    console.log('Table startup_returns created successfully!');
    
    // Verify the table was created
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'startup_returns';
    `;
    
    if (tables.length > 0) {
      console.log('Verification: Table exists in the database.');
    } else {
      console.error('Error: Table was not created.');
    }
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
    process.exit(0);
  }
}

// Run the setup
setupDatabase();
