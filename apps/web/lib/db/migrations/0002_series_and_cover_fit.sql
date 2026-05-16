ALTER TABLE "posts" ADD COLUMN "cover_image_fit" text;
--> statement-breakpoint
CREATE TABLE "series" (
  "id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series_translations" (
  "series_id" text NOT NULL,
  "locale" text NOT NULL,
  "title" text NOT NULL,
  PRIMARY KEY ("series_id", "locale"),
  CONSTRAINT "series_translations_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
INSERT INTO "series" ("id")
SELECT DISTINCT series_id FROM "posts" WHERE series_id IS NOT NULL
ON CONFLICT DO NOTHING;
