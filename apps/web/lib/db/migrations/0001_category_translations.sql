-- Create category_translations table (mirrors post_translations pattern)
CREATE TABLE "category_translations" (
  "category_slug" text NOT NULL,
  "locale" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "slug" text NOT NULL,
  CONSTRAINT "category_translations_category_slug_locale_pk" PRIMARY KEY("category_slug","locale"),
  CONSTRAINT "category_translations_locale_slug_unique" UNIQUE("locale","slug")
);
--> statement-breakpoint
ALTER TABLE "category_translations"
  ADD CONSTRAINT "category_translations_category_slug_categories_slug_fk"
  FOREIGN KEY ("category_slug") REFERENCES "public"."categories"("slug") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Seed existing categories as English translations
-- (canonical slug becomes the EN locale slug as well)
INSERT INTO "category_translations" ("category_slug", "locale", "name", "description", "slug")
SELECT "slug", 'en', "name", "description", "slug"
FROM "categories";
--> statement-breakpoint

-- Remove name and description from categories (now in translations)
ALTER TABLE "categories" DROP COLUMN "name";
--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "description";
