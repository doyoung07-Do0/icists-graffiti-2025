-- Create final_matching table to record team-startup matches
CREATE TABLE "final_matching" (
  "team" varchar(10) PRIMARY KEY,
  "startup" varchar(2) NOT NULL CHECK ("startup" IN ('s1', 's2', 's3', 's4', 's5'))
); 