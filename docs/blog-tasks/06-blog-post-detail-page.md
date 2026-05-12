# [Page] Blog Post Detail — `/[lng]/blog/[id]/[slug]`

**Labels:** `blog`, `ux`  
**Milestone:** Public Pages  
**Depends on:** #02 (public API), #04 (Cloudinary)  
**Blocks:** #08 (syntax highlight + TOC), #09 (reading time + related), #07 (SEO)

## Context

Post detail page. MDX content rendered with custom components. Locale-aware. Supports draft preview via secret URL.

## URL Structure

```
/en/blog/01HX.../my-post-slug         # published post
/blog/preview/[previewToken]           # draft preview (no [lng] prefix, secret URL)
```

## Page Sections

1. **Hero** — cover image (full-width, optional), category badge, title, author, date, reading time
2. **Table of Contents** (sticky sidebar on desktop — see #08)
3. **MDX Content** — rendered with custom component map
4. **Post Footer** — tags list, series navigation (prev/next in series, see #16)
5. **Related Posts** — grid of 3 related posts (see #09)

## MDX Component Map

| MDX element             | Component                                          |
| ----------------------- | -------------------------------------------------- |
| `<img>` / `<BlogImage>` | `BlogImage` (from #04)                             |
| `<pre>` / `<code>`      | `CodeBlock` with syntax highlight + copy (see #08) |
| `h2`, `h3`, `h4`        | Heading with anchor `id` (for TOC links)           |
| `a`                     | `@sdlgr/link`                                      |
| Callouts (`> [!NOTE]`)  | `Callout` component                                |

## Tasks

- [ ] Create `app/[lng]/blog/[id]/[slug]/page.next.tsx` (Server Component)
  - Fetch post by `id` from `GET /api/posts/[id]`
  - Verify `slug` matches — redirect canonical if mismatch (SEO guard)
  - 404 if post not found or not published
- [ ] Create `app/blog/preview/[token]/page.next.tsx` — preview route
  - Fetch by `previewToken` (new query helper `getPostByPreviewToken`)
  - Show "PREVIEW MODE" banner
  - No auth needed (token is the secret)
- [ ] Create `lib/mdx/renderMDX.ts` — compile + render MDX string with `next-mdx-remote`
- [ ] Register MDX component map in `lib/mdx/components.tsx`
- [ ] Create `libs/post-hero/` lib:
  - `PostHero.tsx`
  - `PostHero.styles.ts`
  - `PostHero.spec.tsx`
  - `index.ts`
- [ ] Create `libs/callout/` lib (MDX `[!NOTE]`, `[!WARNING]`, `[!TIP]` variants)
- [ ] Add `generateStaticParams` for ISR pre-rendering of published posts
- [ ] Add `revalidate = 60` (ISR — see #16 for on-demand revalidation)
- [ ] Install `next-mdx-remote`: add to deps in `apps/web/package.json`

## Acceptance Criteria

- [ ] `/en/blog/[id]/[slug]` renders MDX content correctly
- [ ] Wrong slug → 301 redirect to canonical slug
- [ ] Draft post → 404 on public route
- [ ] `/blog/preview/[validToken]` renders draft post with preview banner
- [ ] `/blog/preview/[invalidToken]` → 404
- [ ] 100% test coverage

## Notes

- `id` in URL is for stable DB lookup; `slug` is for human-readable URL + SEO
- Canonical redirect: `GET /en/blog/abc123/wrong-slug` → 301 → `/en/blog/abc123/correct-slug`
- `next-mdx-remote` needed because MDX content is stored in DB (not filesystem)
