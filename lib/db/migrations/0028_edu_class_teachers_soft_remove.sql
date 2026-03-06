-- Add role, isActive, assignedAt, removedAt to edu_class_teachers for soft-remove support
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'edu_class_teachers' AND column_name = 'role') THEN
    ALTER TABLE "edu_class_teachers" ADD COLUMN "role" varchar(20) DEFAULT 'primary' NOT NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'edu_class_teachers' AND column_name = 'is_active') THEN
    ALTER TABLE "edu_class_teachers" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'edu_class_teachers' AND column_name = 'assigned_at') THEN
    ALTER TABLE "edu_class_teachers" ADD COLUMN "assigned_at" timestamp DEFAULT now() NOT NULL;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'edu_class_teachers' AND column_name = 'removed_at') THEN
    ALTER TABLE "edu_class_teachers" ADD COLUMN "removed_at" timestamp;
  END IF;
END $$;