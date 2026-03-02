CREATE TABLE "classroom_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"author_user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"body" text,
	"file_url" text,
	"link_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classroom_posts" ADD CONSTRAINT "classroom_posts_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_posts" ADD CONSTRAINT "classroom_posts_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "classroom_posts_class_created_idx" ON "classroom_posts" USING btree ("class_id","created_at");