# Blog Page Redesign

## Goals

- Feature the latest post as a full-width hero above the filter/grid section
- Redesign filters: search-as-you-type, multi-select category, multi-select tags, date picker (year → month)
- Keep URL-based state for shareability and SSR first-paint
- Reuse existing components (`PostCard`, `PostHero` styles, `CategoryFilter`, `TagFilter`, chips)

---

## Search: PostgreSQL FTS vs External Service

### Why not Algolia / Typesense

| Service               | Free tier                  | Limits                                                                 | Verdict          |
| --------------------- | -------------------------- | ---------------------------------------------------------------------- | ---------------- |
| Algolia Community     | 10k records, 10k req/month | Reachable with moderate traffic; needs sync webhook on every post save | Risky long-term  |
| Typesense Cloud       | 14-day trial only          | No permanent free tier                                                 | Non-starter      |
| Typesense self-hosted | Free                       | Needs a server you own                                                 | Extra infra cost |

For a personal blog (likely < 500 posts ever), an external search service adds operational complexity (sync logic on create/update/delete, API keys, another vendor) with no meaningful UX benefit over a well-indexed Postgres query.

### Decision: PostgreSQL Full-Text Search

The DB is already Neon Postgres. Upgrade the existing `ilike` query to use `tsvector` + `tsquery` with a GIN index. This gives:

- Typo-tolerant stemming per locale (`to_tsvector('english', ...)` / `'spanish'`)
- Sub-millisecond queries on GIN index even at thousands of posts
- Zero cost, zero extra service, zero sync logic

**Implementation**: Add a generated `tsvector` column to `post_translations` via Drizzle migration, index it with GIN, replace the `ilike OR` clause in `getPublishedPostsPaginated` with `@@`. Scoped to a dedicated follow-up commit/PR to keep the diff clean. The API contract (`q` param) does not change, so `BlogPage` needs no changes when it ships.

**Future upgrade path**: If search needs grow (typo tolerance, faceting, analytics), Algolia Community plan is a viable drop-in replacement — the API contract (q param → posts array) doesn't change.

---

## Decisions

| Question                                             | Decision                                                                                                                                             |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero post: globally latest or filtered?              | Always the globally latest published post. Filters do not affect it. Hero is hidden when any filter is active (filtered results may not include it). |
| Year/month filter: additive or resets other filters? | Additive — all params coexist in URL.                                                                                                                |
| Month display i18n                                   | Month names rendered via `date-fns/locale` (locale-aware). `month` URL param stays as 1-based integer.                                               |

---

## Layout

```
┌─────────────────────────────────────────────────────┐
│  Page title + accent                                │
├─────────────────────────────────────────────────────┤
│  LATEST POST HERO (full width, no section title)   │
│  CoverImage 1440px wide, object-fit: cover          │
│  Overlay gradient bottom → title area               │
│  Series badge (if any)                              │
│  Category · Tags                                    │
│  Excerpt (full)                                     │
│  Author · Date · Reading time                       │
│  "Read more →" CTA                                  │
├─────────────────────────────────────────────────────┤
│  FILTERS                                            │
│  "Filter by" label                                  │
│  [  Search posts...               🔍 ]              │
│  Categories: [All] [Tech ✓] [Career ✓] …  ← multi  │
│  Tags:       [react ✓] [nextjs] …         ← multi  │
│  Date:       [2024 ▾] → [Jan] [Feb] [Mar] …        │
├─────────────────────────────────────────────────────┤
│  POST GRID (excludes the hero post)                 │
│  3-col desktop / 2-col tablet / 1-col mobile        │
├─────────────────────────────────────────────────────┤
│  PAGINATION                                         │
└─────────────────────────────────────────────────────┘
```

Hero is **always the globally latest published post** and is **hidden when any filter is active**.

---

## Latest Post Hero (`LatestPostHero`)

New component in `apps/web/components/LatestPostHero/`.

Props mirror `PostHeroProps` minus `url`/share fields (those are composed inside using the post's own URL), plus `readMoreLabel`.

Reuses:

- `StyledCoverWrapper` / `StyledHeroContent` pattern from `@sdlgr/post-hero`
- `CldImage` with `fill` + `sizes="(max-width: 1440px) 100vw, 1440px"`
- Series badge markup from `PostHero`
- Tag chips from `BlogFilters.styles`

Key style differences from `PostHero`:

- Full bleed inside the page container (no inner padding clipping the image)
- Excerpt rendered in full (not truncated)
- "Read more →" link at the bottom

---

## Filters Redesign

### Search bar

- `SearchInput` client component in `libs/blog-filters`
- Controlled input + 300ms debounce with `useDebounce` hook (new tiny hook in `libs/blog-filters`)
- On debounce fires: `router.replace(url, { scroll: false })` via `useRouter` + `startTransition` — marks the navigation as non-urgent so current results stay visible while new ones load
- Clears `page` param on change

### Category filter — multi-select

`CategoryFilter` updated to support **multi-select**. Clicking a category toggles it in/out of the active set. "All" clears all selections.

- Active categories stored as comma-separated canonical slugs: `?categories=technology,career`
- DB query updated: single `category` param replaced by `categories?: string[]` — generates `IN (...)` clause
- "All" chip shown when no categories selected; clicking any category deselects "All"

### Tag filter — multi-select

`TagFilter` updated to support **multi-select**, same pattern as categories.

- Active tags stored as comma-separated values: `?tags=react,nextjs`
- DB query: `tag` param replaced by `tags?: string[]` — generates `ANY(...)` or repeated `@>` conditions

### Date filter

New `DateFilter` client component in `libs/blog-filters`.

UX: **year chips → month chips**

Rationale over date-range picker:

- A personal blog has sparse, irregular posts — a range picker would show many empty months
- Year → month chips show only dates that have real data (fetched from DB)
- One click to select year, one click to select month — 2 interactions max vs a calendar widget

Data needed: new DB query `getPostPublishedDates(locale)` returning `{ year: number; months: number[] }[]` — ordered desc.

URL params: `year=2024&month=3` (month is 1-based integer). Selecting a year clears the month. Month names rendered with `date-fns/locale` for the active `lng`.

### Filter section layout

```
FILTER BY                    ← small uppercase label

[ Search posts...       🔍 ] ← full width

Categories  ← label
[All] [Technology(3) ✓] [Career(1) ✓]   ← multi-select chips

Tags  ← label
[react(5) ✓] [nextjs(4)] …              ← multi-select chips

Date  ← label
[2024] [2023] [2022]         ← year chips (desc, only with posts)
  └─ if year selected:
     [Jan] [Mar] [Sep]       ← month chips (only months in that year with posts)
```

---

## URL State

All filters live in URL search params. No client-side state store needed.

| Filter     | Param        | Format            | Example                         |
| ---------- | ------------ | ----------------- | ------------------------------- |
| Search     | `q`          | string            | `?q=react`                      |
| Categories | `categories` | comma-separated   | `?categories=technology,career` |
| Tags       | `tags`       | comma-separated   | `?tags=react,nextjs`            |
| Year       | `year`       | integer           | `?year=2024`                    |
| Month      | `month`      | integer (1-based) | `?month=3`                      |
| Page       | `page`       | integer           | `?page=2`                       |

Changing any filter resets `page` to 1. All filters are additive.

---

## DB Changes

### New query: `getPostPublishedDates`

```ts
// Returns years with months that have at least one published post
getPostPublishedDates(locale: Locale): Promise<{ year: number; months: number[] }[]>
```

Implemented with a single SQL query using `date_part` + `array_agg`.

### Updated query: `getPublishedPostsPaginated`

- `category?: string` → `categories?: string[]` (generates `IN` clause)
- `tag?: string` → `tags?: string[]` (generates repeated `@>` or `ANY` clause)
- Add `year?: number` and `month?: number` (generate `date_part` WHERE clauses)

### Full-text search migration (follow-up commit)

- Add `search_vector` generated column to `post_translations`
- GIN index on `search_vector`
- Replace `ilike` with `@@ to_tsquery`
- Locale-aware: `'english'` for `en`, `'spanish'` for `es`

Scoped to a separate commit on this same PR to keep the migration diff isolated. The `q` URL param contract does not change.

---

## Components to Create / Modify

| Component                    | Location                              | Action                                                                |
| ---------------------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `LatestPostHero`             | `apps/web/components/LatestPostHero/` | New                                                                   |
| `SearchInput`                | `libs/blog-filters/src/lib/`          | New                                                                   |
| `DateFilter`                 | `libs/blog-filters/src/lib/`          | New                                                                   |
| `useDebounce`                | `libs/blog-filters/src/lib/`          | New (hook)                                                            |
| `BlogFilters`                | `libs/blog-filters/src/lib/`          | New — wrapper composing Search + Category + Tag + Date                |
| `CategoryFilter`             | existing                              | Multi-select logic + restyle                                          |
| `TagFilter`                  | existing                              | Multi-select logic + restyle                                          |
| `BlogPage`                   | existing                              | Add hero, use new `BlogFilters`, pass `categories`/`tags`/date params |
| `getPublishedPostsPaginated` | existing                              | `categories[]`, `tags[]`, `year`, `month` params                      |
| `getPostPublishedDates`      | new query                             | New                                                                   |

---

## Implementation Order (single PR, multiple commits)

1. DB: `getPostPublishedDates` query + update `getPublishedPostsPaginated` (multi categories/tags + date)
2. `LatestPostHero` component + tests
3. `SearchInput` + `useDebounce` + `DateFilter` in `libs/blog-filters`
4. Update `CategoryFilter` + `TagFilter` to multi-select
5. `BlogFilters` wrapper
6. Wire everything into `BlogPage`
7. All tests at 100% coverage
8. Follow-up commit: PostgreSQL FTS migration
