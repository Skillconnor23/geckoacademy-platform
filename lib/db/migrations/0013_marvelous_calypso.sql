CREATE TABLE "edu_quiz_classes" (
	"quiz_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "edu_quizzes" DROP CONSTRAINT "edu_quizzes_class_id_edu_classes_id_fk";
--> statement-breakpoint
DROP INDEX "edu_quizzes_class_status_idx";--> statement-breakpoint
ALTER TABLE "edu_quiz_classes" ADD CONSTRAINT "edu_quiz_classes_quiz_id_edu_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."edu_quizzes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "edu_quiz_classes" ADD CONSTRAINT "edu_quiz_classes_class_id_edu_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."edu_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "edu_quiz_classes_quiz_class_idx" ON "edu_quiz_classes" USING btree ("quiz_id","class_id");--> statement-breakpoint
CREATE INDEX "edu_quiz_classes_class_idx" ON "edu_quiz_classes" USING btree ("class_id");--> statement-breakpoint
INSERT INTO "edu_quiz_classes" ("quiz_id", "class_id") SELECT "id", "class_id" FROM "edu_quizzes" WHERE "class_id" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "edu_quizzes" DROP COLUMN "class_id";--> statement-breakpoint
ALTER TABLE "edu_quizzes" DROP COLUMN "week_number";--> statement-breakpoint
ALTER TABLE "edu_quizzes" DROP COLUMN "due_at";