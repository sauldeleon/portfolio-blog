# [Page] Blog Post Detail — `/[lng]/blog/[id]/[slug]`

**Labels:** `blog`, `ux`  
**Milestone:** Public Pages  
**Depends on:** #02 (public API), #04 (Cloudinary)  
**Blocks:** #08 (syntax highlight + TOC), #09 (reading time + related), #07 (SEO)

## Context

Post detail page. MDX content rendered with custom components. Locale-aware — title, slug, excerpt, and content come from `post_translations` for the current locale. Supports draft preview via secret URL.

## URL Structure

```
/en/blog/01HX.../adventure-time         # English post
/es/blog/01HX.../tiempo-de-aventuras    # Spanish post (same id, different slug)
/en/blog/01HX.../                       # → 301 redirect to /en/blog/01HX.../adventure-time
/es/blog/01HX.../                       # → 301 redirect to /es/blog/01HX.../tiempo-de-aventuras
/blog/preview/[previewToken]            # draft preview (no [lng] prefix, secret URL)
```

## Slug Redirect Route

`app/[lng]/blog/[id]/page.next.tsx` — handles `/[lng]/blog/[id]` (no slug).

```ts
// app/[lng]/blog/[id]/page.next.tsx
import { getPostById } from '@/lib/db/queries/posts'
import { redirect } from 'next/navigation'

export default async function PostRedirectPage({ params }) {
  const { lng, id } = await params
  const post = await getPostById(id, lng)
  if (!post) notFound()
  redirect(`/${lng}/blog/${id}/${post.slug}`)
}
```

This covers:

- `/en/blog/01HX...` → `301` → `/en/blog/01HX.../adventure-time`
- `/es/blog/01HX...` → `301` → `/es/blog/01HX.../tiempo-de-aventuras`

## Page Sections

1. **Hero** — cover image (full-width, optional), category badge, title (locale), author, date, reading time
2. **Table of Contents** (sticky sidebar on desktop — see #08)
3. **MDX Content** — rendered with custom component map
4. **Post Footer** — tags list, series navigation (prev/next in series, see #15)
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

- [ ] Create `app/[lng]/blog/[id]/page.next.tsx` — slug redirect route (see above)
- [ ] Create `app/[lng]/blog/[id]/[slug]/page.next.tsx` (Server Component)
  - Fetch post by `id` + `lng` from `GET /api/posts/[id]?lng=[lng]`
  - Verify `slug` matches locale translation slug — redirect canonical if mismatch (SEO guard)
  - 404 if post not found, not published, or translation missing for locale
- [ ] Create `app/blog/preview/[token]/page.next.tsx` — preview route
  - Fetch by `previewToken` (new query helper `getPostByPreviewToken`)
  - Show "PREVIEW MODE" banner
  - No auth needed (token is the secret)
  - Detect locale from browser `Accept-Language` or default to `en`
- [ ] Create `lib/mdx/renderMDX.ts` — compile + render MDX string with `next-mdx-remote`
- [ ] Register MDX component map in `lib/mdx/components.tsx`
- [ ] Create `libs/post-hero/` lib:
  - `PostHero.tsx`
  - `PostHero.styles.ts`
  - `PostHero.spec.tsx`
  - `index.ts`
- [ ] Create `libs/callout/` lib (MDX `[!NOTE]`, `[!WARNING]`, `[!TIP]` variants)
- [ ] Add `generateStaticParams` for ISR pre-rendering — generate params for both locales: `[{ lng: 'en', id, slug: enSlug }, { lng: 'es', id, slug: esSlug }]`
- [ ] Add `revalidate = 60` (ISR — see #16 for on-demand revalidation)
- [ ] Install `next-mdx-remote`: add to deps in `apps/web/package.json`

## Acceptance Criteria

- [ ] `/en/blog/[id]/[slug-en]` renders MDX content with English title/content
- [ ] `/es/blog/[id]/[slug-es]` renders MDX content with Spanish title/content
- [ ] `/en/blog/[id]` (no slug) → 301 redirect to `/en/blog/[id]/[slug-en]`
- [ ] `/es/blog/[id]` (no slug) → 301 redirect to `/es/blog/[id]/[slug-es]`
- [ ] Wrong slug → 301 redirect to canonical locale slug
- [ ] Draft post → 404 on public route
- [ ] `/blog/preview/[validToken]` renders draft post with preview banner
- [ ] `/blog/preview/[invalidToken]` → 404
- [ ] `generateStaticParams` covers both locales for all published posts
- [ ] 100% test coverage

## Notes

- `id` in URL is for stable DB lookup; `slug` is locale-specific and decorative for SEO
- Canonical redirect: `GET /en/blog/abc123/wrong-slug` → 301 → `/en/blog/abc123/correct-en-slug`
- `next-mdx-remote` needed because MDX content is stored in DB (not filesystem)
- `generateStaticParams` must produce entries for both locales — iterate published posts and expand each into two params objects
