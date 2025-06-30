import { db } from '@/lib/db';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../.env.local') });

async function getDatabaseInfo() {
  try {
    console.log('=== Database Information ===');
    
    // 1. Get current database name and user
    const dbInfo = await db.execute('SELECT current_database(), current_user, current_schema();');
    console.log('\n1. Database Connection Info:');
    console.table(dbInfo[0]);
    
    // 2. List all schemas
    const schemas = await db.execute(
      "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema') ORDER BY schema_name;"
    );
    console.log('\n2. Available Schemas:');
    console.table(schemas);
    
    // 3. List all tables in public schema
    const tables = await db.execute(
      "SELECT table_name, table_schema FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
    );
    console.log('\n3. Tables in public schema:');
    console.table(tables);
    
    // 4. Check search_path
    const searchPath = await db.execute('SHOW search_path;');
    console.log('\n4. Search Path:');
    console.table(searchPath[0]);
    
    // 5. Try to find startup_returns table in any schema
    console.log('\n5. Searching for startup_returns table in all schemas...');
    const allTables = await db.execute(
      "SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'startup_returns' OR table_name = 'StartupReturn' ORDER BY table_schema, table_name;"
    );
    
    if (allTables.length > 0) {
      console.log('Found matching tables:');
      console.table(allTables);
      
      // 6. Get table structure if found
      for (const table of allTables) {
        console.log(`\nTable structure for ${table.table_schema}.${table.table_name}:`);
        const columns = await db.execute(
          `SELECT column_name, data_type, is_nullable, column_default 
           FROM information_schema.columns 
           WHERE table_schema = '${table.table_schema}' 
           AND table_name = '${table.table_name}'
           ORDER BY ordinal_position;`
        );
        console.table(columns);
      }
    } else {
      console.log('No tables named startup_returns or StartupReturn found in any schema.');
    }
    
    // 7. Check if the table exists with a case-sensitive search
    console.log('\n6. Checking for table with case-sensitive search...');
    const caseSensitiveSearch = await db.execute(
      "SELECT tablename FROM pg_tables WHERE tablename IN ('startup_returns', 'StartupReturn');"
    );
    console.table(caseSensitiveSearch);
    
  } catch (error) {
    console.error('Error getting database info:', error);
  } finally {
    process.exit(0);
  }
}

// Run the function
getDatabaseInfo();
