# [Admin] Category Management

**Labels:** `blog`, `cms`, `api`  
**Milestone:** Admin CMS  
**Depends on:** #03 (auth + categories write API), #10 (admin layout)  
**Blocks:** #11 (post editor category dropdown)

## Context

Categories are predefined and admin-managed (not free-form like tags). Must be created before any post can be written. The post editor category `<select>` (from #11) depends on this list existing.

## UI — `/admin/categories`

Simple CRUD list. No pagination needed (expected < 20 categories).

```
┌─────────────────────────────────────────────┐
│ Categories                   [+ New Category] │
├──────────────────────────────────────────────┤
│ Slug          Name           Posts   Actions  │
│ engineering   Engineering    12      Edit  Del │
│ life          Life           3       Edit  Del │
│ ...                                           │
└──────────────────────────────────────────────┘
```

- **Slug** — immutable PK (shown read-only in edit form, not editable)
- **Name** — display name (editable)
- **Posts** — count of posts using this category (live from DB)
- **Edit** — inline edit or modal: update `name` + `description`
- **Delete** — calls `DELETE /api/categories/[slug]`:
  - If ≥1 published post references category → disabled button with tooltip "N posts use this category"
  - If 0 published posts (only drafts or none) → confirm dialog then delete

## New Category Form

Inline form or modal:

```
Slug:        [engineering        ]  (auto-generated from name, editable, validated /^[a-z0-9-]+$/)
Name:        [Engineering        ]
Description: [Optional summary   ]
             [Cancel] [Create]
```

- Slug auto-generates from name (same `slugify` util from #15)
- Slug validated unique on submit — show inline error if 409
- On create → row appears in list

## Tasks

- [ ] Create `app/admin/categories/page.next.tsx` (Server Component — fetches list with post counts)
- [ ] Create `app/admin/categories/CategoryTable.tsx` (Client Component — edit, delete, optimistic updates)
- [ ] Create `app/admin/categories/CategoryForm.tsx` (Client Component — new/edit form)
- [ ] Add `GET /api/categories` count per category — extend query to include `post_count`:
  ```sql
  SELECT c.*, COUNT(p.id) AS post_count
  FROM categories c
  LEFT JOIN posts p ON p.category = c.slug AND p.deleted_at IS NULL
  GROUP BY c.slug
  ORDER BY c.name
  ```
  Update `getCategories()` in `lib/db/queries/categories.ts` to return `postCount`
- [ ] Add "Categories" nav link to `app/admin/layout.next.tsx`
- [ ] Slug auto-generation in form using `slugify` from `lib/utils/slugify.ts` (from #15)
- [ ] Delete button disabled + tooltip when published posts reference category (count from `postCount`)
- [ ] Confirm dialog before delete when 0 published posts
- [ ] Optimistic UI: new row appears immediately, rolls back on API error
- [ ] Edit inline (or modal): update name + description, slug shown as read-only text

## Acceptance Criteria

- [ ] `/admin/categories` lists all categories with post counts
- [ ] Create new category → appears in list, available in post editor dropdown
- [ ] Slug auto-generates from name, is editable before submit
- [ ] Duplicate slug → inline 409 error shown
- [ ] Edit name/description → updates in list
- [ ] Delete with 0 published posts → confirm dialog → row removed
- [ ] Delete with published posts → button disabled with count tooltip
- [ ] "Categories" nav link in admin sidebar
- [ ] 100% test coverage on `CategoryTable`, `CategoryForm`, updated `getCategories` query

## Notes

- This ticket is a prerequisite for #11 (post editor) — must ship before post creation works end-to-end
- Category slug immutable — never allow editing slug post-create (it's FK in posts table)
- `postCount` in list uses LEFT JOIN — category with 0 posts still shows (count = 0)
- Add to dependency map: #18 blocks #11
