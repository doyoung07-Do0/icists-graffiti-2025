-- Add s5 column to team_r1 table
ALTER TABLE "team_r1" ADD COLUMN "s5" integer DEFAULT 0 NOT NULL;

-- Add s5 column to team_r2 table
ALTER TABLE "team_r2" ADD COLUMN "s5" integer DEFAULT 0 NOT NULL;

-- Add s5 column to team_r3 table
ALTER TABLE "team_r3" ADD COLUMN "s5" integer DEFAULT 0 NOT NULL;

-- Add s5 column to team_r4 table
ALTER TABLE "team_r4" ADD COLUMN "s5" integer DEFAULT 0 NOT NULL;

-- Insert s5 startup into startup_r1 table
INSERT INTO "startup_r1" ("startup", "pre_cap", "yield", "post_cap") VALUES ('s5', NULL, NULL, NULL);

-- Insert s5 startup into startup_r2 table
INSERT INTO "startup_r2" ("startup", "pre_cap", "yield", "post_cap") VALUES ('s5', NULL, NULL, NULL);

-- Insert s5 startup into startup_r3 table
INSERT INTO "startup_r3" ("startup", "pre_cap", "yield", "post_cap") VALUES ('s5', NULL, NULL, NULL);

-- Insert s5 startup into startup_r4 table
INSERT INTO "startup_r4" ("startup", "pre_cap", "yield", "post_cap") VALUES ('s5', NULL, NULL, NULL); 