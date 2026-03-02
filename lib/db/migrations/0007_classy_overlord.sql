ALTER TABLE "edu_classes" ALTER COLUMN "schedule_timezone" SET DEFAULT 'Asia/Ulaanbaatar';--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "default_meeting_url" text;--> statement-breakpoint
ALTER TABLE "edu_sessions" ADD COLUMN "kind" text;--> statement-breakpoint
ALTER TABLE "edu_sessions" ADD COLUMN "original_starts_at" timestamp;