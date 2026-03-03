DO $$
BEGIN
	IF to_regclass('public.flashcards') IS NULL AND to_regclass('public.flashcard_cards') IS NOT NULL THEN
		ALTER TABLE "flashcard_cards" RENAME TO "flashcards";
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.flashcards') IS NULL THEN
		CREATE TABLE "flashcards" (
			"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
			"deck_id" uuid NOT NULL,
			"front" text NOT NULL,
			"back" text NOT NULL,
			"example" text,
			"sort_order" integer DEFAULT 0 NOT NULL,
			"created_at" timestamp DEFAULT now() NOT NULL
		);
		ALTER TABLE "flashcards" ADD CONSTRAINT "flashcards_deck_id_flashcard_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."flashcard_decks"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END
$$;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.flashcard_cards_deck_sort_idx') IS NOT NULL AND to_regclass('public.flashcards_deck_sort_idx') IS NULL THEN
		ALTER INDEX "flashcard_cards_deck_sort_idx" RENAME TO "flashcards_deck_sort_idx";
	END IF;
END
$$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "flashcards_deck_sort_idx" ON "flashcards" USING btree ("deck_id", "sort_order");
