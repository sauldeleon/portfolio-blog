# Blog Page Redesign

## Goals

- Feature the latest post as a full-width hero above the filter/grid section
- Redesign filters: search-as-you-type, category chips, tag chips, date picker (year → month)
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

**Implementation**: Add a generated `tsvector` column to `post_translations` via Drizzle migration, index it with GIN, replace the `ilike OR` clause in `getPublishedPostsPaginated` with `@@`.

**Future upgrade path**: If search needs grow (typo tolerance, faceting, analytics), Algolia Community plan is a viable drop-in replacement — the API contract (q param → posts array) doesn't change.

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
│  Categories: [All] [Tech] [Career] …                │
│  Tags:       [react] [nextjs] …                     │
│  Date:       [2024 ▾] → [Jan] [Feb] [Mar] …        │
├─────────────────────────────────────────────────────┤
│  POST GRID (excludes the hero post)                 │
│  3-col desktop / 2-col tablet / 1-col mobile        │
├─────────────────────────────────────────────────────┤
│  PAGINATION                                         │
└─────────────────────────────────────────────────────┘
```

When any filter is active the hero post is **hidden** (it might not match the filter, and showing it always would be confusing).

---

## Latest Post Hero (`LatestPostHero`)

New component in `apps/web/components/LatestPostHero/`.

Props mirror `PostHeroProps` minus `url`/share fields (they're added inside with the post's own URL), plus `readMoreLabel`.

Reuses:

- `StyledCoverWrapper` / `StyledHeroContent` pattern from `@sdlgr/post-hero`
- `CldImage` with `fill` + `sizes="(max-width: 1440px) 100vw, 1440px"`
- Series badge markup from `PostHero`
- Tag chips from `BlogFilters.styles`

Key style differences from `PostHero`:

- Wider max-width (full bleed inside the page container)
- Excerpt rendered in full (not truncated)
- "Read more →" link at the bottom

---

## Filters Redesign

### Search bar

- `SearchInput` client component in `libs/blog-filters`
- Controlled input + 300ms debounce with `useDebounce` hook (new tiny hook in `libs/blog-filters`)
- On debounce fires: `router.replace(url, { scroll: false })` via `useRouter` + `startTransition` — marks the navigation as non-urgent so current results stay visible while new ones load
- Clears `page` param on change

### Category filter

Keep existing `CategoryFilter` logic. Restyled to match new filter section (horizontal pill row with label above).

### Tag filter

Keep existing `TagFilter` logic, same restyling.

### Date filter

New `DateFilter` client component in `libs/blog-filters`.

UX: **year chips → month chips**

Rationale over date-range picker:

- A personal blog has sparse, irregular posts — a range picker would show many empty months
- Year → month chips show only dates that have real data (fetched from DB)
- One click to select year, one click to select month — 2 interactions max vs a calendar widget

Data needed: new DB query `getPostPublishedDates(locale)` returning `{ year: number; months: number[] }[]` — ordered desc.

URL params: `year=2024&month=3` (month is 1-based). Selecting a year clears the month. Selecting a month requires a year to be set first.

### Filter section layout

```
FILTER BY                    ← small uppercase label

[ Search posts...       🔍 ] ← full width

Categories  ← label
[All] [Technology(3)] [Career(1)]

Tags  ← label
[react(5)] [nextjs(4)] …

Date  ← label
[2024] [2023] [2022]         ← year chips (desc, only with posts)
  └─ if year selected:
     [Jan] [Mar] [Sep]       ← month chips (only months with posts in that year)
```

---

## URL State

All filters live in URL search params. No client-side state store needed.

| Filter   | Param      | Example                |
| -------- | ---------- | ---------------------- |
| Search   | `q`        | `?q=react`             |
| Category | `category` | `?category=technology` |
| Tag      | `tag`      | `?tag=nextjs`          |
| Year     | `year`     | `?year=2024`           |
| Month    | `month`    | `?month=3`             |
| Page     | `page`     | `?page=2`              |

Changing any filter resets `page` to 1.

---

## DB Changes

### New query: `getPostPublishedDates`

```ts
// Returns years with months that have at least one published post
getPostPublishedDates(locale: Locale): Promise<{ year: number; months: number[] }[]>
```

Implemented with a single SQL query using `date_part` + `array_agg`.

### Updated query: `getPublishedPostsPaginated`

Add `year?: number` and `month?: number` to `PaginatedPostsParams`. Add `date_part` WHERE clauses when set.

### Full-text search migration (separate PR)

- Add `search_vector` generated column to `post_translations`
- GIN index on `search_vector`
- Replace `ilike` with `@@ to_tsquery`
- Locale-aware: `'english'` for `en`, `'spanish'` for `es`

This is a DB migration — scope it to a dedicated branch/PR to keep diff clean. The API contract (`q` param) does not change, so `BlogPage` needs no changes when it ships.

---

## Components to Create / Modify

| Component                    | Location                              | Action                                                     |
| ---------------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `LatestPostHero`             | `apps/web/components/LatestPostHero/` | New                                                        |
| `SearchInput`                | `libs/blog-filters/src/lib/`          | New                                                        |
| `DateFilter`                 | `libs/blog-filters/src/lib/`          | New                                                        |
| `useDebounce`                | `libs/blog-filters/src/lib/`          | New (hook)                                                 |
| `BlogFilters`                | `libs/blog-filters/src/lib/`          | New — wrapper that composes Search + Category + Tag + Date |
| `CategoryFilter`             | existing                              | Restyled (no logic change)                                 |
| `TagFilter`                  | existing                              | Restyled (no logic change)                                 |
| `BlogPage`                   | existing                              | Add hero, use new `BlogFilters`, pass date params          |
| `getPublishedPostsPaginated` | existing                              | Add `year`/`month` params                                  |
| `getPostPublishedDates`      | new query                             | New                                                        |

---

## Phases

### Phase 1 — Latest Post Hero + Date Filter (this PR)

1. `getPostPublishedDates` query
2. `LatestPostHero` component
3. `DateFilter` + `useDebounce` + `SearchInput`
4. `BlogFilters` wrapper
5. Wire into `BlogPage`
6. Tests (100% coverage)

### Phase 2 — PostgreSQL FTS (separate PR)

1. Drizzle migration: `search_vector` generated column + GIN index
2. Update `getPublishedPostsPaginated` to use `@@`
3. Update tests

---

## Open Questions

- Should the hero post be the globally latest post, or the latest post matching current filters? **Proposal**: always the globally latest published post, hidden when any filter is active.
- Should the year/month filter be additive with category/tag, or reset them? **Proposal**: additive (all params coexist in URL).
- i18n: month names should use `date-fns/locale` for display, but the `month` URL param stays as a number.
