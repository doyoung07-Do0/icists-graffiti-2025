-- Add user_id column to teams table
ALTER TABLE teams 
ADD COLUMN user_id VARCHAR(255);

-- Add a comment to document the change
COMMENT ON COLUMN teams.user_id IS 'Optional: Link to Clerk user ID';
