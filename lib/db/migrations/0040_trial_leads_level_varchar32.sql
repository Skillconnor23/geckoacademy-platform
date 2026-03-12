-- Widen level columns to accept funnel values (beginner, intermediate, advanced) as well as Gecko (G,E,C,K,O).
-- Preserves existing data; no drops.
ALTER TABLE "trial_leads" ALTER COLUMN "recommended_level" TYPE varchar(32);
--> statement-breakpoint
ALTER TABLE "trial_leads" ALTER COLUMN "final_recommended_level" TYPE varchar(32);
