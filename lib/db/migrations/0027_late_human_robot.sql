-- Add archive support to edu_classes and schools
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'edu_classes' AND column_name = 'is_archived') THEN
    ALTER TABLE "edu_classes" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'edu_classes' AND column_name = 'archived_at') THEN
    ALTER TABLE "edu_classes" ADD COLUMN "archived_at" timestamp;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'is_archived') THEN
    ALTER TABLE "schools" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'archived_at') THEN
    ALTER TABLE "schools" ADD COLUMN "archived_at" timestamp;
  END IF;
END $$;