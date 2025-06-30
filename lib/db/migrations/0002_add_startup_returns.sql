-- Create the startup_returns table
CREATE TABLE IF NOT EXISTS startup_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_name VARCHAR(20) NOT NULL CHECK (round_name IN ('r1', 'r2', 'r3', 'r4')),
  s1_return INTEGER NOT NULL DEFAULT 0,
  s2_return INTEGER NOT NULL DEFAULT 0,
  s3_return INTEGER NOT NULL DEFAULT 0,
  s4_return INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(round_name)
);

-- Create an index on round_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_startup_returns_round_name ON startup_returns(round_name);
