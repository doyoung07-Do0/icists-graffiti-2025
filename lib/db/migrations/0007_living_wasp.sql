CREATE TABLE "round_state" (
	"round" varchar PRIMARY KEY NOT NULL,
	"status" varchar NOT NULL,
	"yield_s1" integer,
	"yield_s2" integer,
	"yield_s3" integer,
	"yield_s4" integer
);
