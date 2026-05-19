ALTER TABLE "posts" ADD COLUMN "post_number" integer GENERATED ALWAYS AS IDENTITY;
--> statement-breakpoint
CREATE UNIQUE INDEX "posts_post_number_unique_idx" ON "posts" ("post_number");
