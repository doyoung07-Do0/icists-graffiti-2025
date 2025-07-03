ALTER TABLE "startup_r1" DROP CONSTRAINT "startup_r1_s1_s2_s3_s4_pk";--> statement-breakpoint
ALTER TABLE "startup_r2" DROP CONSTRAINT "startup_r2_s1_s2_s3_s4_pk";--> statement-breakpoint
ALTER TABLE "startup_r3" DROP CONSTRAINT "startup_r3_s1_s2_s3_s4_pk";--> statement-breakpoint
ALTER TABLE "startup_r4" DROP CONSTRAINT "startup_r4_s1_s2_s3_s4_pk";--> statement-breakpoint
ALTER TABLE "startup_r1" ADD COLUMN "startup" varchar PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "startup_r2" ADD COLUMN "startup" varchar PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "startup_r3" ADD COLUMN "startup" varchar PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "startup_r4" ADD COLUMN "startup" varchar PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "startup_r1" DROP COLUMN "s1";--> statement-breakpoint
ALTER TABLE "startup_r1" DROP COLUMN "s2";--> statement-breakpoint
ALTER TABLE "startup_r1" DROP COLUMN "s3";--> statement-breakpoint
ALTER TABLE "startup_r1" DROP COLUMN "s4";--> statement-breakpoint
ALTER TABLE "startup_r2" DROP COLUMN "s1";--> statement-breakpoint
ALTER TABLE "startup_r2" DROP COLUMN "s2";--> statement-breakpoint
ALTER TABLE "startup_r2" DROP COLUMN "s3";--> statement-breakpoint
ALTER TABLE "startup_r2" DROP COLUMN "s4";--> statement-breakpoint
ALTER TABLE "startup_r3" DROP COLUMN "s1";--> statement-breakpoint
ALTER TABLE "startup_r3" DROP COLUMN "s2";--> statement-breakpoint
ALTER TABLE "startup_r3" DROP COLUMN "s3";--> statement-breakpoint
ALTER TABLE "startup_r3" DROP COLUMN "s4";--> statement-breakpoint
ALTER TABLE "startup_r4" DROP COLUMN "s1";--> statement-breakpoint
ALTER TABLE "startup_r4" DROP COLUMN "s2";--> statement-breakpoint
ALTER TABLE "startup_r4" DROP COLUMN "s3";--> statement-breakpoint
ALTER TABLE "startup_r4" DROP COLUMN "s4";