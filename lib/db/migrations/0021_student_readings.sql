CREATE TABLE "edu_readings" (
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
ALTER TABLE "edu_readings" ADD CONSTRAINT "edu_readings_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "edu_reading_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reading_id" uuid NOT NULL,
	"student_user_id" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edu_reading_completions" ADD CONSTRAINT "edu_reading_completions_reading_id_edu_readings_id_fk" FOREIGN KEY ("reading_id") REFERENCES "public"."edu_readings"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "edu_reading_completions" ADD CONSTRAINT "edu_reading_completions_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "edu_readings_class_id_idx" ON "edu_readings" USING btree ("class_id");
--> statement-breakpoint
CREATE INDEX "edu_readings_week_of_idx" ON "edu_readings" USING btree ("week_of");
--> statement-breakpoint
CREATE UNIQUE INDEX "edu_reading_completions_reading_student_idx" ON "edu_reading_completions" USING btree ("reading_id","student_user_id");
--> statement-breakpoint
CREATE INDEX "edu_reading_completions_reading_idx" ON "edu_reading_completions" USING btree ("reading_id");
--> statement-breakpoint
CREATE INDEX "edu_reading_completions_student_idx" ON "edu_reading_completions" USING btree ("student_user_id");
