-- Add optional columns to edu_quiz_questions for spelling, sentence builder, and media
ALTER TABLE "edu_quiz_questions" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "edu_quiz_questions" ADD COLUMN IF NOT EXISTS "audio_url" text;
ALTER TABLE "edu_quiz_questions" ADD COLUMN IF NOT EXISTS "hint" text;
ALTER TABLE "edu_quiz_questions" ADD COLUMN IF NOT EXISTS "metadata" jsonb;
