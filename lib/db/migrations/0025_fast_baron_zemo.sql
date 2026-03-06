-- Schools organizational layer: schools, school_memberships, edu_classes.school_id
CREATE TABLE IF NOT EXISTS "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "schools_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "school_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
	"user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"role" varchar(30) DEFAULT 'school_admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_memberships_school_user_idx" UNIQUE("school_id","user_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "school_memberships_user_idx" ON "school_memberships" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "school_memberships_school_idx" ON "school_memberships" ("school_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "schools_slug_idx" ON "schools" ("slug");
--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'edu_classes' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE "edu_classes" ADD COLUMN "school_id" uuid REFERENCES "schools"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edu_classes_school_id_idx" ON "edu_classes" ("school_id");
