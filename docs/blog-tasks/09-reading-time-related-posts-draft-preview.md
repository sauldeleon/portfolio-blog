# [UX] Reading Time, Related Posts, Draft Preview

**Labels:** `blog`, `ux`  
**Milestone:** UX  
**Depends on:** #06 (post detail), #05 (listing page)

## Context

Three content-enhancement features for the post detail and listing pages.

---

## 1. Reading Time Estimate

Calculated from MDX word count of the current locale's `content` field. Displayed on listing card and post header.

```ts
// lib/utils/readingTime.ts
export function calculateReadingTime(content: string): number {
  // Strip MDX/HTML tags, count words
  const words = content
    .replace(/<[^>]+>/g, '')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200)) // 200 WPM
}
```

Display: `"5 min read"` (i18n key: `blog.readingTime` → `"{{count}} min read"`)

### Tasks

- [ ] Create `lib/utils/readingTime.ts` with `calculateReadingTime`
- [ ] Add `readingTime` to public post API response (computed from locale `content`, not stored)
- [ ] Display on `PostCard` (listing)
- [ ] Display in `PostHero` (detail page header)
- [ ] Add i18n key `blog.readingTime` in en + es

---

## 2. Related Posts

Show 3 related posts at bottom of post detail page, based on shared tags/category. Returns locale-specific title and slug via `?lng` param.

### Algorithm

```ts
// lib/db/queries/getRelatedPosts.ts
// SELECT posts.*, pt.title, pt.slug, pt.excerpt FROM posts
// JOIN post_translations pt ON pt.post_id = posts.id AND pt.locale = $locale
// WHERE posts.id != $currentId
// AND posts.status = 'published'
// AND posts.deleted_at IS NULL
// AND (posts.category = $currentCategory OR posts.tags && $currentTags)
// ORDER BY matching_tags_count DESC, posts.published_at DESC
// LIMIT 3
```

### UI

- Grid of 3 `PostCard` (reuses component from #05)
- Section heading: `blog.relatedPosts` i18n key
- Hidden if fewer than 1 related post found
- PostCard links use locale-specific slug from translation

### Tasks

- [ ] Add `getRelatedPosts(postId, locale, { category, tags })` query in `lib/db/queries/`
- [ ] Add `GET /api/posts/[id]/related?lng=[lng]` endpoint (public, returns up to 3 posts with locale fields)
- [ ] Add `RelatedPosts` section to `app/[lng]/blog/[id]/[slug]/page.next.tsx`
- [ ] Reuse `PostCard` component
- [ ] Add i18n key `blog.relatedPosts`
- [ ] Hide section if no results

---

## 3. Draft Preview via Secret URL

Allow previewing unpublished posts without auth, via a secret token URL.

URL: `/blog/preview/[token]` (implemented in #06 — this issue covers the token management)

### Flow

1. Post created → `previewToken` auto-generated (UUID v4)
2. Admin copies preview URL from post editor
3. Anyone with URL can view draft (no login needed)
4. Token rotates on post publish (set to null or new value)
5. Preview shows content for both locales — use language toggle or default to `en`

### Tasks

- [ ] Ensure `previewToken` generated in `POST /api/posts` (DB issue #01 already includes field)
- [ ] Return `previewToken` in admin API responses only (never in public `toPublicPost` mapper)
- [ ] Add "Copy preview link" button to admin post editor (from #11)
- [ ] Token rotation: when post published → generate new `previewToken` (so old preview links expire)
- [ ] Add i18n key `admin.copyPreviewLink`, `blog.previewBanner`

---

## Acceptance Criteria

- [ ] Reading time shows on listing cards and post header (computed from locale content)
- [ ] `calculateReadingTime` unit tested with various content sizes
- [ ] Related posts appear at bottom of post with shared category/tags, using locale-specific slugs
- [ ] Related posts hidden when no matches
- [ ] Preview URL works for draft post without login
- [ ] Preview URL 404s after post is published (token rotated)
- [ ] 100% test coverage on all new utilities and components
