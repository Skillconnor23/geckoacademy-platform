CREATE TABLE "homework" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"title" text NOT NULL,
	"instructions" text,
	"due_date" timestamp,
	"attachment_url" text,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "homework" ADD CONSTRAINT "homework_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "homework_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"homework_id" uuid NOT NULL,
	"student_user_id" integer NOT NULL,
	"text_note" text,
	"files" jsonb DEFAULT '[]'::jsonb,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"feedback" text,
	"score" integer
);
--> statement-breakpoint
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_homework_id_homework_id_fk" FOREIGN KEY ("homework_id") REFERENCES "public"."homework"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "homework_class_id_idx" ON "homework" USING btree ("class_id");
--> statement-breakpoint
CREATE INDEX "homework_created_by_idx" ON "homework" USING btree ("created_by_user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "homework_submissions_homework_student_idx" ON "homework_submissions" USING btree ("homework_id","student_user_id");
--> statement-breakpoint
CREATE INDEX "homework_submissions_homework_idx" ON "homework_submissions" USING btree ("homework_id");
--> statement-breakpoint
CREATE INDEX "homework_submissions_student_idx" ON "homework_submissions" USING btree ("student_user_id");
