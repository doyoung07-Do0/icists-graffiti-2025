CREATE TABLE IF NOT EXISTS "StartupReturn" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roundId" uuid NOT NULL,
	"s1" numeric(5, 2) NOT NULL,
	"s2" numeric(5, 2) NOT NULL,
	"s3" numeric(5, 2) NOT NULL,
	"s4" numeric(5, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "startup_return_round_id_unique" UNIQUE("roundId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team1" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team1_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team10" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team10_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team11" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team11_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team12" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team12_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team13" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team13_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team14" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team14_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team15" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team15_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team16" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team16_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team2_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team3" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team3_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team4" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team4_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team5" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team5_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team6" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team6_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team7" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team7_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team8" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team8_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team9" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_name" varchar(20) NOT NULL,
	"s1" integer DEFAULT 0 NOT NULL,
	"s2" integer DEFAULT 0 NOT NULL,
	"s3" integer DEFAULT 0 NOT NULL,
	"s4" integer DEFAULT 0 NOT NULL,
	"remain" integer DEFAULT 0 NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team9_round_name_unique" UNIQUE("round_name")
);
--> statement-breakpoint
ALTER TABLE "TeamMarketCap" ALTER COLUMN "teamName" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "TeamMarketCap" ALTER COLUMN "marketCap" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "TeamMarketCap" ALTER COLUMN "marketCap" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "StartupReturn" ADD CONSTRAINT "StartupReturn_roundId_InvestmentRound_id_fk" FOREIGN KEY ("roundId") REFERENCES "public"."InvestmentRound"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
