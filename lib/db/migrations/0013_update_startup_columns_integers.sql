-- Alter startup_r1 table
ALTER TABLE "startup_r1" ALTER COLUMN "pre_cap" TYPE INTEGER USING ROUND("pre_cap")::integer;
ALTER TABLE "startup_r1" ALTER COLUMN "post_cap" TYPE INTEGER USING ROUND("post_cap")::integer;

-- Alter startup_r2 table
ALTER TABLE "startup_r2" ALTER COLUMN "pre_cap" TYPE INTEGER USING ROUND("pre_cap")::integer;
ALTER TABLE "startup_r2" ALTER COLUMN "post_cap" TYPE INTEGER USING ROUND("post_cap")::integer;

-- Alter startup_r3 table
ALTER TABLE "startup_r3" ALTER COLUMN "pre_cap" TYPE INTEGER USING ROUND("pre_cap")::integer;
ALTER TABLE "startup_r3" ALTER COLUMN "post_cap" TYPE INTEGER USING ROUND("post_cap")::integer;

-- Alter startup_r4 table
ALTER TABLE "startup_r4" ALTER COLUMN "pre_cap" TYPE INTEGER USING ROUND("pre_cap")::integer;
ALTER TABLE "startup_r4" ALTER COLUMN "post_cap" TYPE INTEGER USING ROUND("post_cap")::integer;
