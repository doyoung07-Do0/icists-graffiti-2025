CREATE TABLE "startup_r1" (
	"s1" integer NOT NULL,
	"s2" integer NOT NULL,
	"s3" integer NOT NULL,
	"s4" integer NOT NULL,
	"pre_cap" integer,
	"yield" integer,
	"post_cap" integer,
	CONSTRAINT "startup_r1_s1_s2_s3_s4_pk" PRIMARY KEY("s1","s2","s3","s4")
);
--> statement-breakpoint
CREATE TABLE "startup_r2" (
	"s1" integer NOT NULL,
	"s2" integer NOT NULL,
	"s3" integer NOT NULL,
	"s4" integer NOT NULL,
	"pre_cap" integer,
	"yield" integer,
	"post_cap" integer,
	CONSTRAINT "startup_r2_s1_s2_s3_s4_pk" PRIMARY KEY("s1","s2","s3","s4")
);
--> statement-breakpoint
CREATE TABLE "startup_r3" (
	"s1" integer NOT NULL,
	"s2" integer NOT NULL,
	"s3" integer NOT NULL,
	"s4" integer NOT NULL,
	"pre_cap" integer,
	"yield" integer,
	"post_cap" integer,
	CONSTRAINT "startup_r3_s1_s2_s3_s4_pk" PRIMARY KEY("s1","s2","s3","s4")
);
--> statement-breakpoint
CREATE TABLE "startup_r4" (
	"s1" integer NOT NULL,
	"s2" integer NOT NULL,
	"s3" integer NOT NULL,
	"s4" integer NOT NULL,
	"pre_cap" integer,
	"yield" integer,
	"post_cap" integer,
	CONSTRAINT "startup_r4_s1_s2_s3_s4_pk" PRIMARY KEY("s1","s2","s3","s4")
);
