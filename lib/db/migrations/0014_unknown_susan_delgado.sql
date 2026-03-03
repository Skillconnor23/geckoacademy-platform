ALTER TABLE "classroom_posts" ADD COLUMN "quiz_id" uuid;--> statement-breakpoint
ALTER TABLE "classroom_posts" ADD CONSTRAINT "classroom_posts_quiz_id_edu_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."edu_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "classroom_posts_quiz_class_idx" ON "classroom_posts" USING btree ("quiz_id","class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "classroom_posts_quiz_class_unique_idx" ON "classroom_posts" ("quiz_id","class_id") WHERE "quiz_id" IS NOT NULL;