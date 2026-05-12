# [DB] Setup Vercel Postgres + Post Data Model

**Labels:** `blog`, `infra`  
**Milestone:** Foundation  
**Blocks:** all other issues

## Context

Need DB layer before any API or UI work. Vercel Postgres (Neon) with Drizzle ORM — edge-compatible, type-safe, minimal boilerplate.

Two tables: `categories` (predefined, admin-managed) and `posts` (tags stored as `text[]` array — free-form, created at post-write time).

## Tasks

### Vercel Postgres Setup (do this first, before any code)

- [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard) → select project → **Storage** tab → **Create Database** → choose **Postgres** (powered by Neon)
- [ ] Name the database (e.g. `portfolio-blog-db`), select region closest to deployment (e.g. `iad1` US East)
- [ ] Click **Connect** to link the database to the project — Vercel auto-injects env vars into all environments (Production, Preview, Development)
- [ ] Pull env vars to local: `vercel env pull .env.local` — this writes the Postgres vars locally
- [ ] Verify these vars are present in `.env.local`:
  ```
  POSTGRES_URL="postgres://..."           # pooled — use for app queries
  POSTGRES_URL_NON_POOLING="postgres://..." # direct — use for migrations
  POSTGRES_USER="..."
  POSTGRES_HOST="..."
  POSTGRES_PASSWORD="..."
  POSTGRES_DATABASE="..."
  ```
- [ ] Update `.env.local.example` with these keys (no values)

### Code

- [ ] Install deps: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `ulid`
- [ ] Create `lib/db/schema.ts` with both tables:

```ts
export const categories = pgTable('categories', {
  slug: text('slug').primaryKey(), // 'engineering', 'life' — also used as FK in posts
  name: text('name').notNull(), // "Engineering", "Life"
  description: text('description'),
})

export const posts = pgTable('posts', {
  id: text('id').primaryKey(), // ULID
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(), // MDX string
  category: text('category')
    .notNull()
    .references(() => categories.slug),
  tags: text('tags').array().notNull().default([]),
  author: text('author').notNull(),
  status: text('status', { enum: ['draft', 'published', 'archived'] })
    .notNull()
    .default('draft'),
  coverImage: text('cover_image'),
  excerpt: text('excerpt').notNull(),
  seriesId: text('series_id'),
  seriesOrder: integer('series_order'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // soft delete
  previewToken: text('preview_token').unique(), // for draft preview URLs
})
```

- [ ] Add GIN index on `posts.tags` for fast array queries:

```ts
// In migration or drizzle schema extras:
// CREATE INDEX ON posts USING GIN(tags);
```

- [ ] Create `lib/db/index.ts` — Drizzle client using Neon serverless driver (`@neondatabase/serverless`)
- [ ] Create `lib/db/queries/posts.ts` — typed post query helpers:
  - `getPosts({ page, limit, category, tag, status })` — all filters `WHERE deleted_at IS NULL` by default
  - `getPostById(id)`
  - `getPostBySlug(slug)`
  - `getPostByPreviewToken(token)`
  - `createPost(data)`
  - `updatePost(id, data)`
  - `softDeletePost(id)`
  - `getRelatedPosts(postId, limit)`
- [ ] Create `lib/db/queries/categories.ts` — typed category query helpers:
  - `getCategories()` — all categories, ordered by name
  - `getCategoryBySlug(slug)`
  - `createCategory(data)`
  - `updateCategory(slug, data)`
  - `deleteCategory(slug)` — hard delete (validate no posts reference it first)
- [ ] Create `lib/db/queries/tags.ts` — tag helpers (derived from posts, no table):
  - `getAllTags()` — `SELECT DISTINCT unnest(tags) FROM posts WHERE deleted_at IS NULL ORDER BY 1`
  - `getTagsForPost(postId)` — returns `post.tags` array directly
  - `getPostCountPerTag()` — `SELECT unnest(tags) as tag, count(*) FROM posts WHERE status='published' AND deleted_at IS NULL GROUP BY 1`
- [ ] Setup Drizzle config (`drizzle.config.ts`)
- [ ] Add migration scripts: `yarn db:generate`, `yarn db:migrate`, `yarn db:studio`
- [ ] Add env vars to `.env.local.example`: `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `NEXT_PUBLIC_SITE_URL`
- [ ] Run initial migration in dev + staging

## Acceptance Criteria

- [ ] `yarn db:migrate` runs without error
- [ ] Drizzle Studio shows `posts` + `categories` tables with correct columns
- [ ] GIN index on `posts.tags` confirmed in DB
- [ ] `WHERE tags @> ARRAY['react']` query works on published posts
- [ ] All query helpers are typed — no `any`
- [ ] 100% test coverage on all query helpers (use in-memory mock or test DB)

## Notes

- `categories.slug` is PK and FK in `posts.category` — slug changes cascade (or disallow rename, simpler)
- Tags have no table — derived via `unnest()` from posts array; GIN index makes this fast
- Soft delete: `DELETE /api/posts/[id]` sets BOTH `deletedAt = now()` AND `status = 'archived'`. Public queries filter `WHERE deleted_at IS NULL`. Admin "Archived" tab filters `WHERE status = 'archived'`. Both fields stay in sync.
- `previewToken` generated on post creation — random UUID
- `scheduledAt` nullable — cron publish job checks this (see #15)
- Validate unknown category slug at API layer before insert (reject with 422)
- `NEXT_PUBLIC_SITE_URL` — used by sitemap (#07), RSS (#13), JSON-LD (#13), OG image (#14), canonical URLs. Set to `https://sauldeleon.com` in Vercel production env, `http://localhost:4200` locally. Add to Vercel dashboard: Settings → Environment Variables.
- Drizzle migration connection must use `POSTGRES_URL_NON_POOLING` (direct, not pooled) in `drizzle.config.ts`
