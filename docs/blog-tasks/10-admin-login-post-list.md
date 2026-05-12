# [Admin] Login Page + Post List

**Labels:** `blog`, `cms`  
**Milestone:** Admin CMS  
**Depends on:** #03 (auth)  
**Blocks:** #11 (post editor)

## Context

Admin CMS lives at `/admin` (outside `[lng]` segment). Minimal, functional UI. No public branding needed — this is a private tool. Admin UI is English-only. Post list shows translation completeness (EN + ES indicators per row).

---

## Login Page `/admin/login`

Simple email + password form. Submits to next-auth Credentials provider.

### UI

- Centered card layout
- Username field
- Password field (type=password)
- "Sign in" button
- Error message on invalid credentials
- Redirects to `/admin/posts` on success

### Tasks

- [ ] Create `app/admin/login/page.next.tsx`
- [ ] Create `app/admin/login/LoginForm.tsx` (Client Component — needs form state)
- [ ] Call `signIn('credentials', { username, password, redirect: false })` from next-auth
- [ ] Show error from `signIn` response
- [ ] Redirect to `/admin/posts` on success using `router.push`
- [ ] Middleware already guards `/admin/*` — exempt `/admin/login` from guard

---

## Post List `/admin/posts`

Dashboard showing all posts (draft + published + archived). Search and filter. Actions per row.

### UI

- Top bar: "Posts" heading + "New post" button → `/admin/posts/new`
- Logout button (top right)
- Search input (filter by title, client-side for ≤100 posts, server-side if >100)
- Filter tabs: All | Published | Draft | Archived
- Table columns: Title (EN) | Status | Category | Translations | Published date | Updated date | Actions
- **Translations column**: shows `EN ✓ / ES ✓` or `EN ✓ / ES ✗` — indicates which locales have content
- Row actions: Edit → `/admin/posts/[id]` | Preview | Delete (soft) | Publish/Unpublish toggle
- Publish blocked (button disabled with tooltip) if any translation is missing title/content
- Pagination (25 per page)

### Tasks

- [ ] Create `app/admin/posts/page.next.tsx` (Server Component, fetches all posts including drafts with both translations)
- [ ] Create `app/admin/posts/PostTable.tsx` (Client Component for interactivity)
- [ ] Create `app/admin/layout.next.tsx` — shared admin shell (top nav, logout button, "Categories" nav link)
- [ ] Fetch `GET /api/posts?status=all` — add `status=all` support to API (admin-only, check session, no `lng` needed — returns all translations)
- [ ] Show translation status per row: `EN ✓ / ES ✓` based on whether title + content exist per locale
- [ ] "Delete" row action → calls `DELETE /api/posts/[id]`, confirm dialog before
- [ ] "Publish" toggle → disabled if any translation incomplete; calls `PUT /api/posts/[id]` with `{ status: 'published', publishedAt: new Date() }`
- [ ] "Unpublish" → `PUT /api/posts/[id]` with `{ status: 'draft', publishedAt: null }`
- [ ] Optimistic UI update after mutations
- [ ] Loading skeleton while fetching

## Acceptance Criteria

- [ ] `/admin/login` accessible without session
- [ ] Invalid credentials show error message
- [ ] Valid credentials redirect to `/admin/posts`
- [ ] `/admin/posts` redirects to `/admin/login` when unauthenticated (middleware)
- [ ] All posts (all statuses) visible in table
- [ ] Filter tabs work
- [ ] Translations column shows correct EN/ES status per post
- [ ] Publish button disabled when any translation missing content
- [ ] Delete shows confirm dialog, soft-deletes row, removes from table
- [ ] 100% test coverage

## Notes

- Admin UI does not need i18n — English only
- Avoid heavy UI libraries — use styled-components consistent with rest of codebase
- `status=all` query param only works when request has valid admin session (middleware check in API route)
- Admin list title column shows EN title (fallback to ES if EN missing, show `—` if both missing)
