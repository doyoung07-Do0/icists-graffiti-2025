-- Create team tables (team1 through team16)
-- Each table will store investment data for one team across 4 rounds

-- Function to create a team table
CREATE OR REPLACE FUNCTION create_team_table(team_num INT) RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        CREATE TABLE IF NOT EXISTS team%s (
            id SERIAL PRIMARY KEY,
            round_name VARCHAR(20) NOT NULL CHECK (round_name IN (''r1'', ''r2'', ''r3'', ''r4'')),
            s1 INTEGER NOT NULL DEFAULT 0,
            s2 INTEGER NOT NULL DEFAULT 0,
            s3 INTEGER NOT NULL DEFAULT 0,
            s4 INTEGER NOT NULL DEFAULT 0,
            remain INTEGER NOT NULL DEFAULT 0,
            total INTEGER NOT NULL DEFAULT 0,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (round_name)
        );
        
        -- Insert initial rows for each round if they don''t exist
        INSERT INTO team%s (round_name, s1, s2, s3, s4, remain, total)
        SELECT r.round_name, 0, 0, 0, 0, 1000, 1000
        FROM (VALUES (''r1''), (''r2''), (''r3''), (''r4'')) AS r(round_name)
        WHERE NOT EXISTS (
            SELECT 1 FROM team%s WHERE round_name = r.round_name
        );
    ', team_num, team_num, team_num);
END;
$$ LANGUAGE plpgsql;

-- Create tables for teams 1-16
DO $$
BEGIN
    FOR i IN 1..16 LOOP
        PERFORM create_team_table(i);
    END LOOP;
END $$;

-- Create a function to update team data
CREATE OR REPLACE FUNCTION update_team_data(
    team_id INT,
    round_name VARCHAR(20),
    s1_val INTEGER,
    s2_val INTEGER,
    s3_val INTEGER,
    s4_val INTEGER,
    remain_val INTEGER,
    total_val INTEGER
) RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        INSERT INTO team%s (round_name, s1, s2, s3, s4, remain, total, updated_at)
        VALUES (%L, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (round_name) DO UPDATE SET
            s1 = EXCLUDED.s1,
            s2 = EXCLUDED.s2,
            s3 = EXCLUDED.s3,
            s4 = EXCLUDED.s4,
            remain = EXCLUDED.remain,
            total = EXCLUDED.total,
            updated_at = EXCLUDED.updated_at;
    ', 
    team_id, 
    round_name, 
    s1_val, s2_val, s3_val, s4_val, remain_val, total_val
    );
END;
$$ LANGUAGE plpgsql;
