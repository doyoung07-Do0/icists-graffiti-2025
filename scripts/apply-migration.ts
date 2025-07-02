import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Get database connection string from environment variables
const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error('POSTGRES_URL environment variable is not set');
  process.exit(1);
}

// Create a database connection
const client = postgres(connectionString, { ssl: 'require' });
const db = drizzle(client);

async function applyMigration() {
  console.log('Applying migration: Add user_id to teams table');
  
  try {
    // Check if the column already exists
    // Check if the column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'teams' AND column_name = 'user_id';
    `;
    
    const result = await client.unsafe(checkQuery);
    
    if (result && result.length > 0) {
      console.log('Migration already applied: user_id column exists in teams table');
      await client.end();
      return;
    }
    
    // Apply the migration
    console.log('Adding user_id column to teams table...');
    await client.unsafe(`
      ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
      
      COMMENT ON COLUMN teams.user_id IS 'Optional: Link to Clerk user ID';
    `);
    
    console.log('Migration applied successfully');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

applyMigration();
