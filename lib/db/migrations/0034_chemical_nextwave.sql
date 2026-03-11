CREATE TABLE "class_lesson_post_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_post_id" integer NOT NULL,
	"asset_type" varchar(80) NOT NULL,
	"entity_type" varchar(80),
	"entity_id" text,
	"label" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_lesson_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"class_id" uuid NOT NULL,
	"curriculum_module_id" integer,
	"lesson_number" integer,
	"title" text NOT NULL,
	"lesson_date" date,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_lesson_post_assets" ADD CONSTRAINT "class_lesson_post_assets_lesson_post_id_class_lesson_posts_id_fk" FOREIGN KEY ("lesson_post_id") REFERENCES "public"."class_lesson_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_lesson_posts" ADD CONSTRAINT "class_lesson_posts_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_lesson_posts" ADD CONSTRAINT "class_lesson_posts_curriculum_module_id_curriculum_modules_id_fk" FOREIGN KEY ("curriculum_module_id") REFERENCES "public"."curriculum_modules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_lesson_posts" ADD CONSTRAINT "class_lesson_posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_lesson_post_assets_lesson_post_id_idx" ON "class_lesson_post_assets" USING btree ("lesson_post_id");--> statement-breakpoint
CREATE INDEX "class_lesson_posts_class_created_idx" ON "class_lesson_posts" USING btree ("class_id","created_at");--> statement-breakpoint
CREATE INDEX "class_lesson_posts_class_id_idx" ON "class_lesson_posts" USING btree ("class_id");