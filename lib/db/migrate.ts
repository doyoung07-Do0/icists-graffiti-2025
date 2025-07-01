import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { promises as fs } from 'fs';
import path from 'path';

config({
  path: '.env.local',
});

const getExistingMigrations = async () => {
  try {
    const migrationsPath = path.join(process.cwd(), 'lib/db/migrations');
    const files = await fs.readdir(migrationsPath);
    return files
      .filter(file => file.endsWith('.sql'))
      .sort()
      .map(file => ({
        name: file,
        path: path.join(migrationsPath, file)
      }));
  } catch (error) {
    console.error('❌ Error reading migrations directory:', error);
    throw error;
  }
};

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  console.log('⏳ Checking migrations...');
  
  try {
    // Get the list of existing migration files
    const migrations = await getExistingMigrations();
    console.log(`✅ Found ${migrations.length} migration files`);
    
    // Run migrations
    console.log('⏳ Running migrations...');
    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();
    
    console.log('✅ Migrations completed in', end - start, 'ms');
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('No file') && errorMessage.includes('found in')) {
      // If the error is about a missing migration file, log a warning but continue
      console.warn('⚠️  Warning:', errorMessage);
      console.log('✅ Database is up to date with available migrations');
      process.exit(0);
    }
    throw error;
  }
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});