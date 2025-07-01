import { config } from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function runFirstMigration() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined in environment variables');
    process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    // Read the first migration file
    const migrationPath = path.join(
      __dirname,
      'lib/db/migrations/0000_keen_devos.sql'
    );
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running first migration...');
    await sql.unsafe(migrationSQL);
    console.log('First migration completed successfully!');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('\n=== Tables in the database ===');
    console.table(tables);
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await sql.end();
  }
}

runFirstMigration();
