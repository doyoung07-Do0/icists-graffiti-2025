-- Alter startup_r1 table
ALTER TABLE "startup_r1" ALTER COLUMN "yield" TYPE DECIMAL(10, 4) USING "yield"::numeric(10,4);
ALTER TABLE "startup_r1" ALTER COLUMN "post_cap" TYPE DECIMAL(10, 4) USING "post_cap"::numeric(10,4);

-- Alter startup_r2 table
ALTER TABLE "startup_r2" ALTER COLUMN "yield" TYPE DECIMAL(10, 4) USING "yield"::numeric(10,4);
ALTER TABLE "startup_r2" ALTER COLUMN "post_cap" TYPE DECIMAL(10, 4) USING "post_cap"::numeric(10,4);

-- Alter startup_r3 table
ALTER TABLE "startup_r3" ALTER COLUMN "yield" TYPE DECIMAL(10, 4) USING "yield"::numeric(10,4);
ALTER TABLE "startup_r3" ALTER COLUMN "post_cap" TYPE DECIMAL(10, 4) USING "post_cap"::numeric(10,4);

-- Alter startup_r4 table
ALTER TABLE "startup_r4" ALTER COLUMN "yield" TYPE DECIMAL(10, 4) USING "yield"::numeric(10,4);
ALTER TABLE "startup_r4" ALTER COLUMN "post_cap" TYPE DECIMAL(10, 4) USING "post_cap"::numeric(10,4);
