#!/bin/bash

# Load environment variables from .env.local
set -a
source .env.local
set +a

echo "Dropping all tables in database $POSTGRES_DATABASE..."

# Drop all tables in the database
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE <<EOSQL
-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Generate and execute DROP statements for all tables
DO \$\$
DECLARE
    r RECORD;
    stmt TEXT;
BEGIN
    -- Drop all tables
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
    ) LOOP
        stmt := 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE;';
        EXECUTE stmt;
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;

    -- Drop all sequences
    FOR r IN (
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
        ORDER BY sequence_name
    ) LOOP
        stmt := 'DROP SEQUENCE IF EXISTS "' || r.sequence_name || '" CASCADE;';
        EXECUTE stmt;
        RAISE NOTICE 'Dropped sequence: %', r.sequence_name;
    END LOOP;
END
\$\$;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';
EOSQL

echo "All tables have been dropped. Resetting migration history..."

# Reset the migration history
PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DATABASE <<EOSQL
-- Drop the drizzle_migrations table if it exists
DROP TABLE IF EXISTS "drizzle_migrations" CASCADE;

-- Recreate the drizzle_migrations table
CREATE TABLE IF NOT EXISTS "drizzle_migrations" (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
);
EOSQL

echo "Running migrations..."

# Run migrations with error handling
if npm run db:migrate; then
    echo "✅ Database reset and migrations completed successfully!"
else
    echo "⚠️  Warning: Some migrations might have failed. The database has been reset, but you may need to check the migration files."
    echo "You can try running the migrations manually with: npm run db:migrate"
fi
