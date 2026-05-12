# [API] Public Read Endpoints

**Labels:** `blog`, `api`  
**Milestone:** Foundation  
**Depends on:** #01 (DB schema)  
**Blocks:** #05 (listing page), #06 (post detail)

## Context

Public GET endpoints. No auth required. Posts return only `status = published`. Categories and tags are public (needed for filter UI).

## Endpoints

### `GET /api/posts`

Query params:

- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `category` (optional — matches `posts.category` slug)
- `tag` (optional — `WHERE tags @> ARRAY[$tag]`)
- `q` (optional — full-text search on title + excerpt)

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
```

### `GET /api/posts/[id]`

- Returns single published post by ID
- 404 if not found, archived, or deleted

### `GET /api/categories`

Returns all categories (public — needed for filter UI and post editor).

Response:

```ts
{
  data: Array<{ slug: string; name: string; description: string | null }>
}
```

### `GET /api/tags`

Returns all distinct tags across published posts, with post count per tag.

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

## Tasks

- [ ] Create `app/api/posts/route.ts` — GET handler with pagination + filter
- [ ] Create `app/api/posts/[id]/route.ts` — GET single post
- [ ] Create `app/api/categories/route.ts` — GET all categories
- [ ] Create `app/api/tags/route.ts` — GET all tags with counts
- [ ] Add response types in `lib/types/api.ts`: `PublicPost`, `Category`, `TagWithCount`
- [ ] Validate query params with `zod`
- [ ] Return appropriate HTTP status codes (200, 400, 404)
- [ ] Add `Cache-Control` headers for public caching (`s-maxage=60, stale-while-revalidate=3600`)
- [ ] `GET /api/categories` and `GET /api/tags` also cached (categories change rarely, tags derived live)

## Acceptance Criteria

- [ ] `GET /api/posts` returns paginated published posts
- [ ] `?category=engineering` filters to posts with that category slug
- [ ] `?tag=react` filters to posts containing `react` in tags array
- [ ] `GET /api/posts/:id` returns 404 for drafts and deleted posts
- [ ] `GET /api/categories` returns all categories ordered by name
- [ ] `GET /api/tags` returns distinct tags with counts, ordered by count desc
- [ ] Invalid query params return 400 with zod error details
- [ ] 100% test coverage (mock DB layer)

## Notes

- Do NOT expose `previewToken`, `deletedAt`, or `content` (full MDX) in list responses
- Strip internal fields — use a `toPublicPost(post)` mapper (list vs detail responses may differ — list omits `content`)
- Tags endpoint is derived — no tags table exists, data comes from `unnest(posts.tags)`
