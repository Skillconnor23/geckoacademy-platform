ALTER TABLE "class_lesson_post_assets" ADD COLUMN "is_placeholder" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "class_lesson_post_assets" ADD COLUMN "placeholder_message" text;