CREATE TABLE IF NOT EXISTS "trial_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200),
	"email" varchar(255),
	"phone" varchar(50),
	"learner_type" varchar(20),
	"locale" varchar(10),
	"source" varchar(100),
	"self_selected_level" varchar(50),
	"recommended_level" varchar(10),
	"status" varchar(30) DEFAULT 'started' NOT NULL,
	"placement_score" integer,
	"placement_level" varchar(1),
	"placement_answers" jsonb,
	"placement_completed_at" timestamp,
	"final_recommended_level" varchar(10),
	"final_recommended_class" text,
	"final_notes" text,
	"user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_leads_email_idx" ON "trial_leads" ("email");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_leads_phone_idx" ON "trial_leads" ("phone");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_leads_status_idx" ON "trial_leads" ("status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_leads_created_idx" ON "trial_leads" ("created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trial_access_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trial_lead_id" uuid NOT NULL REFERENCES "trial_leads"("id") ON DELETE CASCADE,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_access_tokens_trial_lead_idx" ON "trial_access_tokens" ("trial_lead_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_access_tokens_expires_idx" ON "trial_access_tokens" ("expires_at");
--> statement-breakpoint
ALTER TABLE "trial_bookings" ADD COLUMN IF NOT EXISTS "trial_lead_id" uuid REFERENCES "trial_leads"("id") ON DELETE SET NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trial_bookings_trial_lead_idx" ON "trial_bookings" ("trial_lead_id");
