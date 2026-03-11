CREATE TABLE IF NOT EXISTS "trial_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255),
	"slot_id" varchar(50) NOT NULL,
	"slot_label" text NOT NULL,
	"recommended_level" varchar(50),
	"locale" varchar(10),
	"questionnaire_answers" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"reminder_status" varchar(30),
	"reminder_sent_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_bookings_created_idx" ON "trial_bookings" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_bookings_phone_idx" ON "trial_bookings" ("phone");
