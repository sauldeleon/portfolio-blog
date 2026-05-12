# [API] Public Read Endpoints

**Labels:** `blog`, `api`  
**Milestone:** Foundation  
**Depends on:** #01 (DB schema)  
**Blocks:** #05 (listing page), #06 (post detail)

## Context

Public GET endpoints. No auth required. Posts return only `status = published`. All post endpoints require `?lng` param — response includes locale-specific fields from `post_translations`. Categories and tags are public (needed for filter UI) and locale-agnostic.

## Endpoints

### `GET /api/posts?lng=en`

Query params:

- `lng` (required — `'en'` | `'es'`) — joins `post_translations` for this locale
- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `category` (optional — matches `posts.category` slug)
- `tag` (optional — `WHERE tags @> ARRAY[$tag]`)
- `q` (optional — full-text search on `post_translations.title` + `post_translations.excerpt` for given locale)

Response:

```ts
{
  data: PublicPost[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
  }
}

type PublicPost = {
  id: string
  // locale-specific (from post_translations):
  title: string
  slug: string
  excerpt: string
  // locale-agnostic (from posts):
  category: string
  tags: string[]
  author: string
  coverImage: string | null
  publishedAt: string
  updatedAt: string
  seriesId: string | null
  seriesOrder: number | null
  // computed:
  readingTime: number  // minutes, computed from content word count (not stored)
}
```

### `GET /api/posts/[id]?lng=en`

- Returns single published post by ID, joining translation for `lng`
- Includes `content` (MDX) — omitted from list endpoint
- 404 if not found, archived, deleted, or translation missing for requested locale
- 400 if `lng` missing or invalid

### `GET /api/categories`

Returns all categories (public — needed for filter UI and post editor). Locale-agnostic.

Response:

```ts
{
  data: Array<{ slug: string; name: string; description: string | null }>
}
```

### `GET /api/tags`

Returns all distinct tags across published posts, with post count per tag. Locale-agnostic.

Response:

```ts
{
  data: Array<{ tag: string; count: number }>
}
```

Uses `getPostCountPerTag()` from `lib/db/queries/tags.ts`:

```sql
SELECT unnest(tags) AS tag, COUNT(*) AS count
FROM posts
WHERE status = 'published' AND deleted_at IS NULL
GROUP BY 1
ORDER BY count DESC, tag ASC;
```

### `GET /api/posts/[id]/related?lng=en`

- Returns up to 3 related published posts (same category or shared tags)
- Response includes locale-specific fields for `lng`
- Used by post detail page (see #09)

## Tasks

- [ ] Create `app/api/posts/route.ts` — GET handler with pagination + filter, requires `lng`
- [ ] Create `app/api/posts/[id]/route.ts` — GET single post with translation for `lng`
- [ ] Create `app/api/posts/[id]/related/route.ts` — GET related posts with `lng`
- [ ] Create `app/api/categories/route.ts` — GET all categories
- [ ] Create `app/api/tags/route.ts` — GET all tags with counts
- [ ] Add response types in `lib/types/api.ts`: `PublicPost`, `PublicPostDetail`, `Category`, `TagWithCount`
- [ ] Validate query params with `zod` — `lng` is required enum `['en', 'es']` on post endpoints
- [ ] Return appropriate HTTP status codes (200, 400, 404)
- [ ] Add `Cache-Control` headers for public caching (`s-maxage=60, stale-while-revalidate=3600`)
- [ ] `GET /api/categories` and `GET /api/tags` also cached (categories change rarely, tags derived live)
- [ ] Create `app/api/posts/route.spec.ts` — test GET pagination, filters, lng validation
- [ ] Create `app/api/posts/[id]/route.spec.ts` — test GET single post, 404 cases
- [ ] Create `app/api/posts/[id]/related/route.spec.ts` — test related posts response
- [ ] Create `app/api/categories/route.spec.ts` — test GET all categories
- [ ] Create `app/api/tags/route.spec.ts` — test GET tags with counts

## Acceptance Criteria

- [ ] `GET /api/posts?lng=en` returns paginated published posts with EN title/slug/excerpt
- [ ] `GET /api/posts?lng=es` returns same posts with ES title/slug/excerpt
- [ ] `GET /api/posts` (no lng) → 400
- [ ] `?category=engineering` filters to posts with that category slug
- [ ] `?tag=react` filters to posts containing `react` in tags array
- [ ] `GET /api/posts/:id?lng=en` returns 404 for drafts and deleted posts
- [ ] `GET /api/categories` returns all categories ordered by name
- [ ] `GET /api/tags` returns distinct tags with counts, ordered by count desc
- [ ] Invalid query params return 400 with zod error details
- [ ] 100% test coverage (mock DB layer)

## Notes

- Do NOT expose `previewToken`, `deletedAt` in public responses
- List response omits `content` (MDX) — only detail endpoint includes it
- `readingTime` computed server-side from `content` word count — not stored in DB
- Tags and categories are locale-agnostic — no `lng` param needed there
