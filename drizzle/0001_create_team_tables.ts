import { sql } from 'drizzle-orm';
import { pgTable, varchar, integer, timestamp, unique } from 'drizzle-orm/pg-core';

// Function to generate SQL for creating a team table
const createTeamTableSQL = (teamNumber: number) => {
  const tableName = `team${teamNumber}`;
  
  return sql`
    CREATE TABLE IF NOT EXISTS ${sql.raw(tableName)} (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      round_name VARCHAR(20) NOT NULL CHECK (round_name IN ('r1', 'r2', 'r3', 'r4')),
      s1 INTEGER NOT NULL DEFAULT 0,
      s2 INTEGER NOT NULL DEFAULT 0,
      s3 INTEGER NOT NULL DEFAULT 0,
      s4 INTEGER NOT NULL DEFAULT 0,
      remain INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (round_name)
    );
  `;
};

export async function up(db: any) {
  // Create team tables
  for (let i = 1; i <= 16; i++) {
    await db.run(createTeamTableSQL(i));
  }
  
  // Insert initial data for each round for each team
  for (let teamNum = 1; teamNum <= 16; teamNum++) {
    for (const round of ['r1', 'r2', 'r3', 'r4']) {
      await db.run(sql`
        INSERT INTO ${sql.raw(`team${teamNum}`)} (round_name, s1, s2, s3, s4, remain, total)
        VALUES (${round}, 0, 0, 0, 0, 0, 0)
        ON CONFLICT (round_name) DO NOTHING;
      `);
    }
  }
}

export async function down(db: any) {
  // Drop all team tables
  for (let i = 1; i <= 16; i++) {
    await db.run(sql`DROP TABLE IF EXISTS ${sql.raw(`team${i}`)};`);
  }
}
