CREATE TYPE "public"."round_status" AS ENUM('locked', 'open', 'closed');--> statement-breakpoint
CREATE TABLE "game_rounds" (
	"id" integer PRIMARY KEY NOT NULL,
	"round_number" integer NOT NULL,
	"status" "round_status" NOT NULL,
	"yield_s1" numeric(10, 4),
	"yield_s2" numeric(10, 4),
	"yield_s3" numeric(10, 4),
	"yield_s4" numeric(10, 4),
	"market_cap_s1" numeric(20, 4),
	"market_cap_s2" numeric(20, 4),
	"market_cap_s3" numeric(20, 4),
	"market_cap_s4" numeric(20, 4),
	CONSTRAINT "game_rounds_round_number_unique" UNIQUE("round_number")
);
--> statement-breakpoint
CREATE TABLE "portfolios" (
	"id" integer PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"investment_s1" numeric(20, 4) DEFAULT '0' NOT NULL,
	"investment_s2" numeric(20, 4) DEFAULT '0' NOT NULL,
	"investment_s3" numeric(20, 4) DEFAULT '0' NOT NULL,
	"investment_s4" numeric(20, 4) DEFAULT '0' NOT NULL,
	"capital_at_start" numeric(20, 4) NOT NULL,
	"capital_at_end" numeric(20, 4),
	"is_submitted" boolean DEFAULT false NOT NULL,
	"submitted_at" timestamp,
	CONSTRAINT "portfolios_team_id_round_id_pk" PRIMARY KEY("team_id","round_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"current_capital" numeric(20, 4) DEFAULT '1000.0000' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Stream" DROP CONSTRAINT "Stream_id_pk";--> statement-breakpoint
ALTER TABLE "Stream" ALTER COLUMN "createdAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "Stream" ADD CONSTRAINT "Stream_chatId_streamId_pk" PRIMARY KEY("chatId","streamId");--> statement-breakpoint
ALTER TABLE "Stream" ADD COLUMN "streamId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."game_rounds"("id") ON DELETE cascade ON UPDATE no action;