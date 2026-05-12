# [Testing] E2E Tests — Cypress

**Labels:** `blog`, `testing`  
**Milestone:** Testing  
**Depends on:** all feature issues  
**Blocks:** nothing (final milestone)

## Context

E2E tests in `apps/web-e2e` (existing Cypress setup). Cover the main user-facing flows and admin CMS flows.

## Test Flows

### Public Blog Flows

#### `blog-listing.cy.ts`

- [ ] Visit `/en/blog` → see list of published posts
- [ ] Click category filter → URL updates, list filtered
- [ ] Click tag filter → URL updates, list filtered
- [ ] Pagination: click "Next" → page 2 loads
- [ ] Click post card → navigates to post detail

#### `blog-post-detail.cy.ts`

- [ ] Visit `/en/blog/[id]/[slug]` → post content renders
- [ ] Table of contents visible, clicking heading scrolls to section
- [ ] Code block copy button: click → clipboard updated (use `cy.window().its('navigator.clipboard')` mock)
- [ ] Related posts section visible (if data present)
- [ ] Series navigation visible for series posts (prev/next)
- [ ] Wrong slug → redirects to canonical slug

#### `blog-draft-preview.cy.ts`

- [ ] `/blog/preview/[validToken]` → shows draft post with preview banner
- [ ] `/blog/preview/[invalidToken]` → 404 page

### Admin CMS Flows

#### `admin-auth.cy.ts`

- [ ] Visit `/admin/posts` → redirects to `/admin/login`
- [ ] Login with wrong credentials → error message shown
- [ ] Login with correct credentials → redirects to `/admin/posts`
- [ ] Click logout → redirects to `/admin/login`, `/admin/posts` inaccessible

#### `admin-post-management.cy.ts`

- [ ] Create new post: fill form, save draft → appears in post list as Draft
- [ ] Edit post: change title, save → updated in list
- [ ] Publish post: click Publish → status changes to Published
- [ ] Unpublish post: click Unpublish → status changes to Draft
- [ ] Delete post: click Delete, confirm → removed from list (soft delete)
- [ ] Archived tab shows soft-deleted post, Restore works

#### `admin-post-editor.cy.ts`

- [ ] Slug auto-generates from title input
- [ ] MDX preview updates after typing in editor (wait for debounce)
- [ ] Cover image upload: attach file → preview appears in form
- [ ] Tag input: type tag + Enter → tag chip appears
- [ ] Schedule publish: set future datetime → saved as Scheduled

#### `admin-image-manager.cy.ts`

- [ ] Visit `/admin/images` → image grid renders
- [ ] Upload new image → appears in grid
- [ ] Copy URL button → (clipboard verified)
- [ ] Delete image → removed from grid

### SEO / Infra Flows

#### `rss.cy.ts`

- [ ] Visit `/feed.xml` → valid XML response, content-type is `application/rss+xml`

## Setup

### Cypress env vars (for admin login)

```ts
// cypress.config.ts env:
{
  ADMIN_USERNAME: process.env.CYPRESS_ADMIN_USERNAME,
  ADMIN_PASSWORD: process.env.CYPRESS_ADMIN_PASSWORD,
}
```

### Custom Cypress commands

```ts
// cypress/support/commands.ts
Cypress.Commands.add('adminLogin', () => {
  cy.visit('/admin/login')
  cy.get('[data-testid="username"]').type(Cypress.env('ADMIN_USERNAME'))
  cy.get('[data-testid="password"]').type(Cypress.env('ADMIN_PASSWORD'))
  cy.get('[type="submit"]').click()
  cy.url().should('include', '/admin/posts')
})
```

### Test data

- Seed a known post in DB before test run (Cypress `before` hook using API)
- Or use fixtures with mocked API responses for isolated tests
- Prefer real API calls against a test DB instance

## Tasks

- [ ] Create `apps/web-e2e/src/e2e/blog/blog-listing.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/blog/blog-post-detail.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/blog/blog-draft-preview.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/admin/admin-auth.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/admin/admin-post-management.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/admin/admin-post-editor.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/admin/admin-image-manager.cy.ts`
- [ ] Create `apps/web-e2e/src/e2e/seo/rss.cy.ts`
- [ ] Add `adminLogin` custom command to `cypress/support/commands.ts`
- [ ] Add `data-testid` attributes to all form fields and action buttons across admin UI
- [ ] Document E2E test setup in `apps/web-e2e/README.md`

## Acceptance Criteria

- [ ] All flows listed above pass in CI
- [ ] Tests run against `yarn start:web` (local) and staging URL
- [ ] No flaky tests — use `cy.intercept` stubs where timing is unpredictable
