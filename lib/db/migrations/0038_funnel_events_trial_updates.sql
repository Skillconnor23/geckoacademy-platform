CREATE TABLE IF NOT EXISTS "funnel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event" varchar(80) NOT NULL,
	"properties" jsonb DEFAULT '{}',
	"locale" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funnel_events_event_idx" ON "funnel_events" ("event");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "funnel_events_created_idx" ON "funnel_events" ("created_at");
--> statement-breakpoint
ALTER TABLE "trial_bookings" ADD COLUMN IF NOT EXISTS "trial_time" timestamp;
--> statement-breakpoint
ALTER TABLE "trial_bookings" ADD COLUMN IF NOT EXISTS "learner_type" varchar(20);
