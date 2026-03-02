ALTER TABLE "users" ADD COLUMN "school_id" text;--> statement-breakpoint
CREATE INDEX "users_school_id_idx" ON "users" USING btree ("school_id");