import { config } from 'dotenv';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function runMigrations() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined in environment variables');
    process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    // Get list of all migration files
    const migrationsDir = path.join(__dirname, 'lib/db/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`\nRunning migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      
      try {
        await sql.unsafe(migrationSQL);
        console.log(`✅ Successfully applied migration: ${file}`);
      } catch (error) {
        console.error(`❌ Error running migration ${file}:`, error);
        throw error;
      }
    }

    // Verify all tables were created
    console.log('\n=== Verifying database tables ===');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('\n=== Tables in the database ===');
    console.table(tables);

  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
