# [Page] Blog Listing — `/[lng]/blog`

**Labels:** `blog`, `ux`  
**Milestone:** Public Pages  
**Depends on:** #02 (public API), #04 (Cloudinary)  
**Blocks:** #07 (SEO)

## Context

Public paginated blog listing. Locale-aware (uses existing `[lng]` segment). Filterable by category and tag. Translated UI via existing `@sdlgr/i18n-*` libs.

## URL Structure

```
/en/blog                          # page 1, no filter
/en/blog?page=2                   # pagination
/en/blog?category=engineering     # category filter
/en/blog?tag=react                # tag filter
/en/blog?category=eng&tag=react   # combined filter
/es/blog?page=1&category=...      # Spanish locale
```

## UI Components

### `PostCard`

Displays in listing grid:

- Cover image (`CldImage` via `next-cloudinary`, optional — fallback placeholder)
- Category badge
- Title
- Excerpt (truncated to 2 lines)
- Author + date (`publishedAt` formatted locale-aware)
- Estimated reading time (from `readingTime` field computed at render)
- Tags (max 3 shown, `+N more` if overflow)
- Link to `/[lng]/blog/[id]/[slug]`

### `CategoryFilter`

- Horizontal scrollable chip list
- Active chip highlighted
- Updates URL search params (no full reload — `useRouter` push)

### `TagFilter`

- Similar chip UI to CategoryFilter

### `Pagination`

- Previous / Next + page numbers
- Updates URL search params

### Page layout

- H1 with translated "Blog" heading
- Filter row (category + tag)
- Post grid (2 cols desktop, 1 col mobile)
- Pagination

## Tasks

- [ ] Create `app/[lng]/blog/page.next.tsx` (Server Component — fetches from API)
- [ ] Create `libs/post-card/` lib:
  - `PostCard.tsx`
  - `PostCard.styles.ts`
  - `PostCard.spec.tsx`
  - `index.ts`
- [ ] Create `libs/blog-filters/` lib:
  - `CategoryFilter.tsx` (Client Component)
  - `TagFilter.tsx` (Client Component)
  - `BlogFilters.styles.ts`
  - `*.spec.tsx`
  - `index.ts`
- [ ] Create `libs/pagination/` lib (reusable):
  - `Pagination.tsx` (Client Component)
  - `Pagination.styles.ts`
  - `Pagination.spec.tsx`
  - `index.ts`
- [ ] Add i18n keys: `blog.title`, `blog.noResults`, `blog.readMore`, `blog.readingTime`, etc.
- [ ] Fetch categories from `GET /api/categories` for filter chips
- [ ] Fetch tags from `GET /api/tags` for filter chips (use `tag` field from response)
- [ ] `calculateReadingTime` utility implemented in #09 — import from `lib/utils/readingTime.ts`
- [ ] Add loading state (skeleton cards while fetching)
- [ ] Add empty state (no posts match filter)

## Acceptance Criteria

- [ ] `/en/blog` renders list of published posts
- [ ] `/es/blog` renders same posts with Spanish UI text
- [ ] Category filter updates URL and re-fetches
- [ ] Tag filter updates URL and re-fetches
- [ ] Pagination navigates correctly
- [ ] Covers missing → fallback placeholder renders without error
- [ ] 100% test coverage on all new components

## Notes

- Page is a Server Component — fetch data server-side for SEO
- Filter components are Client Components (use URL search params)
- Reading time: ~200 words/min, round to nearest minute, min 1 min
