CREATE TABLE IF NOT EXISTS "TeamMarketCap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roundId" uuid NOT NULL,
	"teamName" varchar(20) NOT NULL,
	"marketCap" numeric(15, 2) DEFAULT '0' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "TeamMarketCap" ADD CONSTRAINT "TeamMarketCap_roundId_InvestmentRound_id_fk" FOREIGN KEY ("roundId") REFERENCES "public"."InvestmentRound"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
