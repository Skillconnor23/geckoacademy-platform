-- Add optional audio fields to edu_readings (teacher-uploaded reading prompt audio)
ALTER TABLE "edu_readings" ADD COLUMN IF NOT EXISTS "audio_url" text;
--> statement-breakpoint
ALTER TABLE "edu_readings" ADD COLUMN IF NOT EXISTS "audio_source" text;
--> statement-breakpoint
ALTER TABLE "edu_readings" ADD COLUMN IF NOT EXISTS "audio_transcript" text;
--> statement-breakpoint
ALTER TABLE "edu_readings" ADD COLUMN IF NOT EXISTS "audio_duration" integer;
--> statement-breakpoint
-- Add optional audio fields to flashcards (teacher-uploaded English-side word audio)
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "audio_url" text;
--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "audio_source" text;
--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "audio_transcript" text;
--> statement-breakpoint
ALTER TABLE "flashcards" ADD COLUMN IF NOT EXISTS "audio_duration" integer;
