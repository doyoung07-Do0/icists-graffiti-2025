CREATE TABLE IF NOT EXISTS "InvestmentRound" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"isActive" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TeamCapital" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roundId" uuid NOT NULL,
	"teamName" varchar(20) NOT NULL,
	"totalCapital" numeric(15, 2) DEFAULT '0' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "TeamPortfolio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roundId" uuid NOT NULL,
	"teamName" varchar(20) NOT NULL,
	"startup" varchar(50) NOT NULL,
	"investmentAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TeamCapital" ADD CONSTRAINT "TeamCapital_roundId_InvestmentRound_id_fk" FOREIGN KEY ("roundId") REFERENCES "public"."InvestmentRound"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TeamPortfolio" ADD CONSTRAINT "TeamPortfolio_roundId_InvestmentRound_id_fk" FOREIGN KEY ("roundId") REFERENCES "public"."InvestmentRound"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
