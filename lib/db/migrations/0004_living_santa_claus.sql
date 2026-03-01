ALTER TABLE "edu_classes" ADD COLUMN "join_code" text;--> statement-breakpoint
ALTER TABLE "edu_classes" ADD COLUMN "join_code_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX "edu_classes_join_code_idx" ON "edu_classes" USING btree ("join_code");--> statement-breakpoint
ALTER TABLE "edu_classes" ADD CONSTRAINT "edu_classes_join_code_unique" UNIQUE("join_code");--> statement-breakpoint
-- Backfill join_code for existing classes (6–8 chars, A-Z + 2–9, no O/0/I/1)
DO $$
DECLARE
  r record;
  new_code text;
  i int;
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
BEGIN
  FOR r IN SELECT id FROM edu_classes WHERE join_code IS NULL
  LOOP
    LOOP
      new_code := '';
      FOR i IN 1..6 LOOP
        new_code := new_code || substr(alphabet, floor(random() * length(alphabet) + 1)::int, 1);
      END LOOP;
      BEGIN
        UPDATE edu_classes SET join_code = new_code, updated_at = now() WHERE id = r.id;
        EXIT;
      EXCEPTION WHEN unique_violation THEN
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;