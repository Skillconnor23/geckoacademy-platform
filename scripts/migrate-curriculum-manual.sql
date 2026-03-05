-- Run manually if db:migrate fails: psql $POSTGRES_URL -f scripts/migrate-curriculum-manual.sql
-- Creates curriculum tables only (no Drizzle journal entry)

CREATE TABLE IF NOT EXISTS "curriculum_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "class_id" uuid NOT NULL REFERENCES "public"."edu_classes"("id") ON DELETE CASCADE,
  "uploader_user_id" integer NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
  "title" text,
  "original_filename" text NOT NULL,
  "storage_path" text NOT NULL,
  "mime_type" text NOT NULL,
  "size_bytes" integer NOT NULL,
  "tag" text,
  "week_number" integer,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "curriculum_weeks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "class_id" uuid NOT NULL REFERENCES "public"."edu_classes"("id") ON DELETE CASCADE,
  "week_number" integer NOT NULL,
  "topic" text,
  "goals" text,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "curriculum_week_files" (
  "week_id" uuid NOT NULL REFERENCES "public"."curriculum_weeks"("id") ON DELETE CASCADE,
  "file_id" uuid NOT NULL REFERENCES "public"."curriculum_files"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "curriculum_files_class_idx" ON "curriculum_files" ("class_id");
CREATE INDEX IF NOT EXISTS "curriculum_files_uploader_idx" ON "curriculum_files" ("uploader_user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_weeks_class_week_idx" ON "curriculum_weeks" ("class_id", "week_number");
CREATE INDEX IF NOT EXISTS "curriculum_weeks_class_idx" ON "curriculum_weeks" ("class_id");
CREATE UNIQUE INDEX IF NOT EXISTS "curriculum_week_files_week_file_idx" ON "curriculum_week_files" ("week_id", "file_id");
CREATE INDEX IF NOT EXISTS "curriculum_week_files_week_idx" ON "curriculum_week_files" ("week_id");
