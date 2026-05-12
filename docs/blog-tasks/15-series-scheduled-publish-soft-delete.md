# [Content] Series, Scheduled Publish, Soft Delete, Slug Auto-gen

**Labels:** `blog`, `cms`, `api`  
**Milestone:** Content Features  
**Depends on:** #03 (write API), #11 (post editor)

## Context

Content management features that extend the core post model. All fields already exist in the DB schema (#01) — this issue covers the UI and API logic.

---

## 1. Series / Multi-part Posts

Group posts into an ordered series (e.g. "Building a Blog, Part 1/3").

### Data

- `seriesId: string` — shared slug for all posts in series (e.g. `"building-a-blog"`)
- `seriesOrder: number` — position in series (1, 2, 3…)

### UI on post detail page

```
┌─────────────────────────────────────┐
│  Part 2 of 3 — "Building a Blog"   │
│  ← Part 1: Setup  |  Part 3: ... → │
└─────────────────────────────────────┘
```

### Tasks

- [ ] Add `GET /api/series/[seriesId]` — returns all posts with that `seriesId`, ordered by `seriesOrder`
- [ ] Create `SeriesNav` component (prev/next links within series)
- [ ] Add `SeriesNav` to post detail page (below hero, above content)
- [ ] Admin post editor: `Series ID` + `Series Order` fields (from #11 — already specified)
- [ ] i18n keys: `blog.series.partOf`, `blog.series.prev`, `blog.series.next`

---

## 2. Scheduled Publish

Set `scheduledAt` to future datetime → post auto-publishes when that time arrives.

### Mechanism

Two options (choose one):

**Option A — On-request check (simpler):**  
On `GET /api/posts`, before returning results, check if any posts have `scheduledAt <= now()` and `status = 'draft'` → auto-publish them.

**Option B — Vercel Cron (more reliable):**  
Add Vercel Cron job at `app/api/cron/publish/route.ts`, runs every 5 minutes.  
`vercel.json`: `{ "crons": [{ "path": "/api/cron/publish", "schedule": "*/5 * * * *" }] }`

Recommend **Option B** — Option A ties publish timing to request traffic.

### Vercel Cron Setup

- [ ] Create `vercel.json` at project root (or update if exists):
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/publish",
        "schedule": "*/5 * * * *"
      }
    ]
  }
  ```
  > Vercel Cron is available on all plans. Free plan limited to 2 cron jobs, daily minimum frequency on free (every 5 min requires Pro). Check plan limits.
- [ ] Generate a `CRON_SECRET` value: `openssl rand -hex 32`
- [ ] Add `CRON_SECRET` to Vercel project env vars:
  - Dashboard → project → **Settings** → **Environment Variables** → add `CRON_SECRET` for Production + Preview
  - Add to `.env.local` manually (not pulled by `vercel env pull` since you set it manually)
  - Add key (no value) to `.env.local.example`
- [ ] Pull any other missing env vars: `vercel env pull .env.local`

### Code Tasks

- [ ] Create `app/api/cron/publish/route.ts`:
  - Verify `Authorization: Bearer <CRON_SECRET>` header — return 401 if missing/wrong
  - Query posts where `scheduled_at <= NOW()` AND `status = 'draft'` AND `deleted_at IS NULL`
  - Update each: `status = 'published'`, `published_at = scheduled_at`
  - Call `revalidateTag('posts')` after batch update (see #16)
- [ ] Admin editor: datetime picker for schedule (from #11)
- [ ] Show "Scheduled for [date]" badge on post list for scheduled posts

---

## 3. Soft Delete

Already in DB schema (`deletedAt`). This issue ensures all queries respect it.

### Rules

- Soft delete sets BOTH `deletedAt = now()` AND `status = 'archived'` — both must be updated atomically
- All public queries filter `WHERE deleted_at IS NULL`
- Admin "Archived" tab filters `WHERE status = 'archived'` (equivalent, but status is more explicit for UI)
- Hard delete not exposed via API
- Restore: sets `deletedAt = null` AND `status = 'draft'`

### Tasks

- [ ] Audit all DB query helpers — verify `WHERE deleted_at IS NULL` in every public-facing query
- [ ] Update `softDeletePost(id)` in `lib/db/queries/posts.ts` to set both `deletedAt = now()` AND `status = 'archived'`
- [ ] Update `restorePost(id)` helper: sets `deletedAt = null`, `status = 'draft'` — add to `lib/db/queries/posts.ts`
- [ ] Add `PUT /api/posts/[id]/restore` endpoint (admin) — calls `restorePost`
- [ ] Add "Restore" action in admin for archived posts (from #10 admin post list)

---

## 4. Slug Auto-generation

Already specified in #11. Extracted here for tracking.

- Auto-generate slug from title on create
- Editable in post editor
- Validate uniqueness on save (return 409 Conflict if slug taken)
- Slug format: `lowercase-kebab-case`, max 100 chars, strip non-alphanumeric except `-`

### Tasks

- [ ] Add uniqueness check in `POST /api/posts` — return 409 if slug taken
- [ ] Add uniqueness check in `PUT /api/posts/[id]` — exclude self from check
- [ ] Create `lib/utils/slugify.ts` — pure function
- [ ] Unit tests for `slugify` (edge cases: unicode, special chars, length)

---

## Acceptance Criteria

- [ ] Posts with same `seriesId` show prev/next navigation
- [ ] Scheduled posts auto-publish at correct time (cron job tested with mocked time)
- [ ] Soft-deleted posts not returned in any public API
- [ ] Archived posts visible + restorable in admin
- [ ] Duplicate slug → 409 response
- [ ] 100% test coverage on all new utilities and API handlers
