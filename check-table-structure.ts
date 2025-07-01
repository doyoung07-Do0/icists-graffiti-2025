import { config } from 'dotenv';
import postgres from 'postgres';

// Load environment variables
config({ path: '.env.local' });

async function checkTableStructure() {
  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined in environment variables');
    process.exit(1);
  }

  const sql = postgres(process.env.POSTGRES_URL, { max: 1 });

  try {
    // Check User table structure
    console.log('\n=== User Table Structure ===');
    const userColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'User'
      ORDER BY ordinal_position;
    `;
    console.table(userColumns);

    // Check Chat table structure
    console.log('\n=== Chat Table Structure ===');
    const chatColumns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Chat'
      ORDER BY ordinal_position;
    `;
    console.table(chatColumns);

    // Check foreign key constraints
    console.log('\n=== Foreign Key Constraints ===');
    const fkConstraints = await sql`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public';
    `;
    console.table(fkConstraints);

  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    await sql.end();
  }
}

checkTableStructure();
