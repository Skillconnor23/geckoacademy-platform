CREATE TABLE "edu_quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"choices" jsonb,
	"correct_answer" jsonb NOT NULL,
	"explanation" text,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_quiz_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"student_user_id" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"score" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"attempt_number" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_quizzes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"week_number" integer,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp,
	"due_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edu_quiz_questions" ADD CONSTRAINT "edu_quiz_questions_quiz_id_edu_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."edu_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_quiz_submissions" ADD CONSTRAINT "edu_quiz_submissions_quiz_id_edu_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."edu_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_quiz_submissions" ADD CONSTRAINT "edu_quiz_submissions_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_quizzes" ADD CONSTRAINT "edu_quizzes_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_quizzes" ADD CONSTRAINT "edu_quizzes_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "edu_quiz_questions_quiz_order_idx" ON "edu_quiz_questions" USING btree ("quiz_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_quiz_submissions_quiz_student_idx" ON "edu_quiz_submissions" USING btree ("quiz_id","student_user_id");--> statement-breakpoint
CREATE INDEX "edu_quiz_submissions_quiz_idx" ON "edu_quiz_submissions" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "edu_quiz_submissions_student_idx" ON "edu_quiz_submissions" USING btree ("student_user_id");--> statement-breakpoint
CREATE INDEX "edu_quizzes_class_status_idx" ON "edu_quizzes" USING btree ("class_id","status");--> statement-breakpoint
CREATE INDEX "edu_quizzes_published_at_idx" ON "edu_quizzes" USING btree ("published_at");