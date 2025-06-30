import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env.local
config({ path: join(__dirname, '../.env.local') });

// Log important environment variables
console.log('Environment Variables:');
console.log('---------------------');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***' : 'Not set'}`);
console.log(`NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set'}`);
console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '***' : 'Not set'}`);
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Not set'}`);

// Test database connection if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  console.log('\nTesting database connection...');
  
  try {
    const { db } = await import('@/lib/db');
    const result = await db.execute('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL Version:', result[0]?.version || 'Unknown');
    
    // Check if startup_returns table exists
    const tableCheck = await db.execute(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'startup_returns'
      ) as exists`
    );
    
    const tableExists = tableCheck[0]?.exists || false;
    console.log(`Table 'startup_returns' exists: ${tableExists ? '✅' : '❌'}`);
    
    if (tableExists) {
      // Check table structure
      const tableInfo = await db.execute(
        `SELECT column_name, data_type, is_nullable 
         FROM information_schema.columns 
         WHERE table_name = 'startup_returns'`
      );
      
      console.log('\nTable structure:');
      console.table(tableInfo);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error instanceof Error ? error.message : error);
  }
} else {
  console.log('\n❌ DATABASE_URL is not set. Please check your .env.local file.');
}
