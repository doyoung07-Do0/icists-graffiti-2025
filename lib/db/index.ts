import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use the DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL!;

// Disable prepared statements for better performance with Vercel Edge
const client = postgres(connectionString, { prepare: false });

// Create the database client with the schema
export const db = drizzle(client, { schema });

// Re-export the schema for easier imports
export * from './schema';
