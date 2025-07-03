import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Create the connection
const connectionString = process.env.POSTGRES_URL!;
const client = postgres(connectionString);

export const db = drizzle(client);
