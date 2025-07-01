import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

async function checkTables() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined in environment variables');
    process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    // Get list of all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('\n=== Tables in the database ===');
    for (const table of tables) {
      console.log(`\nTable: ${table.table_name}`);
      
      // Get table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position;
      `;
      
      console.log('Columns:');
      console.table(columns);
      
      // Get constraints
      const constraints = await sql`
        SELECT conname, contype, pg_get_constraintdef(oid)
        FROM pg_constraint 
        WHERE conrelid = ${table.table_name}::regclass
        ORDER BY conname;
      `;
      
      if (constraints.length > 0) {
        console.log('Constraints:');
        console.table(constraints);
      }
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await sql.end();
  }
}

checkTables();
