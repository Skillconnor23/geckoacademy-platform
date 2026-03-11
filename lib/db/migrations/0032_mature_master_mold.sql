CREATE TABLE "class_curriculum_state" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" uuid NOT NULL,
	"level_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"current_lesson_number" integer DEFAULT 1 NOT NULL,
	"curriculum_started_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "class_curriculum_state_class_id_unique" UNIQUE("class_id")
);
--> statement-breakpoint
CREATE TABLE "curriculum_lesson_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_number" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "curriculum_lesson_types_lesson_number_unique" UNIQUE("lesson_number")
);
--> statement-breakpoint
CREATE TABLE "curriculum_levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(1) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "curriculum_levels_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "curriculum_module_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"lesson_number" integer NOT NULL,
	"lesson_type_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"objective" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"level_id" integer NOT NULL,
	"module_number" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"theme" varchar(200),
	"grammar_focus" text,
	"skill_focus" text,
	"estimated_weeks" integer DEFAULT 4 NOT NULL,
	"estimated_classes" integer DEFAULT 8 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_curriculum_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"class_id" uuid NOT NULL,
	"level_id" integer NOT NULL,
	"current_module_id" integer NOT NULL,
	"current_lesson_number" integer DEFAULT 1 NOT NULL,
	"modules_completed_count" integer DEFAULT 0 NOT NULL,
	"lessons_completed_count" integer DEFAULT 0 NOT NULL,
	"started_current_module_at" timestamp,
	"last_progressed_at" timestamp,
	"estimated_next_level_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform_invites" ADD COLUMN "class_id" uuid;--> statement-breakpoint
ALTER TABLE "class_curriculum_state" ADD CONSTRAINT "class_curriculum_state_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_curriculum_state" ADD CONSTRAINT "class_curriculum_state_level_id_curriculum_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."curriculum_levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_curriculum_state" ADD CONSTRAINT "class_curriculum_state_module_id_curriculum_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."curriculum_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_module_lessons" ADD CONSTRAINT "curriculum_module_lessons_module_id_curriculum_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."curriculum_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_module_lessons" ADD CONSTRAINT "curriculum_module_lessons_lesson_type_id_curriculum_lesson_types_id_fk" FOREIGN KEY ("lesson_type_id") REFERENCES "public"."curriculum_lesson_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_modules" ADD CONSTRAINT "curriculum_modules_level_id_curriculum_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."curriculum_levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_curriculum_progress" ADD CONSTRAINT "student_curriculum_progress_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_curriculum_progress" ADD CONSTRAINT "student_curriculum_progress_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_curriculum_progress" ADD CONSTRAINT "student_curriculum_progress_level_id_curriculum_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."curriculum_levels"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_curriculum_progress" ADD CONSTRAINT "student_curriculum_progress_current_module_id_curriculum_modules_id_fk" FOREIGN KEY ("current_module_id") REFERENCES "public"."curriculum_modules"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_curriculum_state_class_id_idx" ON "class_curriculum_state" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "class_curriculum_state_level_id_idx" ON "class_curriculum_state" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "curriculum_levels_code_idx" ON "curriculum_levels" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "curriculum_module_lessons_module_lesson_idx" ON "curriculum_module_lessons" USING btree ("module_id","lesson_number");--> statement-breakpoint
CREATE INDEX "curriculum_module_lessons_module_id_idx" ON "curriculum_module_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE UNIQUE INDEX "curriculum_modules_level_module_idx" ON "curriculum_modules" USING btree ("level_id","module_number");--> statement-breakpoint
CREATE INDEX "curriculum_modules_level_id_idx" ON "curriculum_modules" USING btree ("level_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_token_hash_idx" ON "password_reset_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "password_reset_tokens_expires_idx" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "student_curriculum_progress_student_class_idx" ON "student_curriculum_progress" USING btree ("student_id","class_id");--> statement-breakpoint
CREATE INDEX "student_curriculum_progress_student_id_idx" ON "student_curriculum_progress" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_curriculum_progress_class_id_idx" ON "student_curriculum_progress" USING btree ("class_id");--> statement-breakpoint
ALTER TABLE "platform_invites" ADD CONSTRAINT "platform_invites_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "platform_invites_class_id_idx" ON "platform_invites" USING btree ("class_id");