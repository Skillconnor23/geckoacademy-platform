CREATE TABLE IF NOT EXISTS "curriculum_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"uploader_user_id" integer NOT NULL,
	"title" text,
	"original_filename" text NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"tag" text,
	"week_number" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum_weeks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"topic" text,
	"goals" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "curriculum_week_files" (
	"week_id" uuid NOT NULL,
	"file_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edu_reading_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reading_id" uuid NOT NULL,
	"student_user_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "edu_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"week_of" date,
	"vocab" jsonb DEFAULT '[]'::jsonb,
	"questions" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD COLUMN "email_verified" timestamp; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "curriculum_files" ADD CONSTRAINT "curriculum_files_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "curriculum_files" ADD CONSTRAINT "curriculum_files_uploader_user_id_users_id_fk" FOREIGN KEY ("uploader_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "curriculum_week_files" ADD CONSTRAINT "curriculum_week_files_week_id_curriculum_weeks_id_fk" FOREIGN KEY ("week_id") REFERENCES "public"."curriculum_weeks"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "curriculum_week_files" ADD CONSTRAINT "curriculum_week_files_file_id_curriculum_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."curriculum_files"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "curriculum_weeks" ADD CONSTRAINT "curriculum_weeks_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "edu_reading_completions" ADD CONSTRAINT "edu_reading_completions_reading_id_edu_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."edu_readings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "edu_reading_completions" ADD CONSTRAINT "edu_reading_completions_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "edu_readings" ADD CONSTRAINT "edu_readings_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "curriculum_files_class_idx" ON "curriculum_files" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "curriculum_files_uploader_idx" ON "curriculum_files" USING btree ("uploader_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_week_files_week_file_idx" ON "curriculum_week_files" USING btree ("week_id","file_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "curriculum_week_files_week_idx" ON "curriculum_week_files" USING btree ("week_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_weeks_class_week_idx" ON "curriculum_weeks" USING btree ("class_id","week_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "curriculum_weeks_class_idx" ON "curriculum_weeks" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "edu_reading_completions_reading_student_idx" ON "edu_reading_completions" USING btree ("reading_id","student_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edu_reading_completions_reading_idx" ON "edu_reading_completions" USING btree ("reading_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edu_reading_completions_student_idx" ON "edu_reading_completions" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edu_readings_class_id_idx" ON "edu_readings" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "edu_readings_week_of_idx" ON "edu_readings" USING btree ("week_of");