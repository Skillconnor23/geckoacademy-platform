CREATE TABLE "curriculum_lesson_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"curriculum_module_lesson_id" integer NOT NULL,
	"asset_type" varchar(80) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"content_ref" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"tag" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "curriculum_lesson_assets" ADD CONSTRAINT "curriculum_lesson_assets_curriculum_module_lesson_id_curriculum_module_lessons_id_fk" FOREIGN KEY ("curriculum_module_lesson_id") REFERENCES "public"."curriculum_module_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_lesson_assets" ADD CONSTRAINT "curriculum_lesson_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "curriculum_lesson_assets_lesson_id_idx" ON "curriculum_lesson_assets" USING btree ("curriculum_module_lesson_id");--> statement-breakpoint
CREATE INDEX "curriculum_lesson_assets_asset_type_idx" ON "curriculum_lesson_assets" USING btree ("asset_type");--> statement-breakpoint
CREATE INDEX "curriculum_lesson_assets_tag_idx" ON "curriculum_lesson_assets" USING btree ("tag");