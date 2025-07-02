-- Create enum type for round status
CREATE TYPE round_status AS ENUM ('locked', 'open', 'closed');

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  current_capitaL DECIMAL(20, 4) NOT NULL DEFAULT 1000.0000
);

-- GameRounds table
CREATE TABLE IF NOT EXISTS game_rounds (
  id SERIAL PRIMARY KEY,
  round_number INTEGER NOT NULL UNIQUE,
  status round_status NOT NULL,
  
  -- Yields for each sector (can be null until round ends)
  yield_s1 DECIMAL(10, 4),
  yield_s2 DECIMAL(10, 4),
  yield_s3 DECIMAL(10, 4),
  yield_s4 DECIMAL(10, 4),
  
  -- Market caps for each sector (can be null)
  market_cap_s1 DECIMAL(20, 4),
  market_cap_s2 DECIMAL(20, 4),
  market_cap_s3 DECIMAL(20, 4),
  market_cap_s4 DECIMAL(20, 4)
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL,
  round_id INTEGER NOT NULL,
  
  -- Investment amounts in each sector (default to 0)
  investment_s1 DECIMAL(20, 4) NOT NULL DEFAULT 0,
  investment_s2 DECIMAL(20, 4) NOT NULL DEFAULT 0,
  investment_s3 DECIMAL(20, 4) NOT NULL DEFAULT 0,
  investment_s4 DECIMAL(20, 4) NOT NULL DEFAULT 0,
  
  -- Capital tracking
  capital_at_start DECIMAL(20, 4) NOT NULL,
  capital_at_end DECIMAL(20, 4),
  
  -- Submission status
  is_submitted BOOLEAN NOT NULL DEFAULT false,
  
  -- Foreign key constraints
  CONSTRAINT fk_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_round FOREIGN KEY (round_id) REFERENCES game_rounds(id) ON DELETE CASCADE,
  
  -- Ensure one portfolio per team per round
  CONSTRAINT unique_team_round UNIQUE (team_id, round_id)
);

-- Create indexes for performance
CREATE INDEX idx_portfolios_team_id ON portfolios(team_id);
CREATE INDEX idx_portfolios_round_id ON portfolios(round_id);
CREATE INDEX idx_portfolios_team_round ON portfolios(team_id, round_id);
