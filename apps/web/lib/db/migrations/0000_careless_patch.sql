CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_translations" (
	"post_id" text NOT NULL,
	"locale" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	CONSTRAINT "post_translations_post_id_locale_pk" PRIMARY KEY("post_id","locale"),
	CONSTRAINT "post_translations_locale_slug_unique" UNIQUE("locale","slug")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"author" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"cover_image" text,
	"series_id" text,
	"series_order" integer,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"preview_token" text,
	CONSTRAINT "posts_preview_token_unique" UNIQUE("preview_token")
);
--> statement-breakpoint
ALTER TABLE "post_translations" ADD CONSTRAINT "post_translations_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_categories_slug_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "posts_tags_gin_idx" ON "posts" USING gin ("tags");