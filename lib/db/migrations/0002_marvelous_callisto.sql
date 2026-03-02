ALTER TABLE "users" ADD COLUMN "platform_role" varchar(20);--> statement-breakpoint
CREATE INDEX "users_platform_role_idx" ON "users" USING btree ("platform_role");