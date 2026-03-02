CREATE TABLE "edu_class_teachers" (
	"class_id" uuid NOT NULL,
	"teacher_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"level" text,
	"timezone" text DEFAULT 'Asia/Ulaanbaatar',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"student_user_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edu_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"meeting_url" text,
	"title" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edu_class_teachers" ADD CONSTRAINT "edu_class_teachers_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_class_teachers" ADD CONSTRAINT "edu_class_teachers_teacher_user_id_users_id_fk" FOREIGN KEY ("teacher_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_enrollments" ADD CONSTRAINT "edu_enrollments_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_enrollments" ADD CONSTRAINT "edu_enrollments_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_sessions" ADD CONSTRAINT "edu_sessions_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "edu_class_teachers_class_teacher_idx" ON "edu_class_teachers" USING btree ("class_id","teacher_user_id");--> statement-breakpoint
CREATE INDEX "edu_class_teachers_teacher_idx" ON "edu_class_teachers" USING btree ("teacher_user_id","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "edu_enrollments_class_student_idx" ON "edu_enrollments" USING btree ("class_id","student_user_id");--> statement-breakpoint
CREATE INDEX "edu_enrollments_student_class_idx" ON "edu_enrollments" USING btree ("student_user_id","class_id");--> statement-breakpoint
CREATE INDEX "edu_sessions_class_starts_idx" ON "edu_sessions" USING btree ("class_id","starts_at");