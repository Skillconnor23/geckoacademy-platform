ALTER TABLE "edu_classes" ADD COLUMN "gecko_level" text;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "schedule_days" jsonb;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "schedule_start_time" text;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "schedule_timezone" text;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "schedule_start_date" date;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "schedule_end_date" date;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "duration_minutes" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" text;