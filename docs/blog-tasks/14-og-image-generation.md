# [SEO] Dynamic OG Image Generation

**Labels:** `blog`, `seo`  
**Milestone:** SEO  
**Depends on:** #07 (SEO meta)

## Context

Per-post dynamic Open Graph images using Next.js `ImageResponse` (`next/og`). Shows post title + optional cover image. Used as `og:image` and `twitter:image`.

## Endpoint

`app/og/route.tsx` — generates 1200×630 PNG

```ts
// Query params:
// ?title=My+Post+Title
// &cover=https://res.cloudinary.com/dmpaja1mw/...  (optional)
// &category=Engineering                              (optional)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'Saúl de León';
  const cover = searchParams.get('cover');
  const category = searchParams.get('category');

  return new ImageResponse(
    <OgImageTemplate title={title} cover={cover} category={category} />,
    { width: 1200, height: 630 }
  );
}
```

## Design (`OgImageTemplate`)

```
┌──────────────────────────────────────────────┐
│                                              │
│  [Cover image blurred background, if set]   │
│  ┌──────────────────────────────────────┐   │
│  │  CATEGORY BADGE                      │   │
│  │                                      │   │
│  │  Post Title (large, bold, max 2 ln)  │   │
│  │                                      │   │
│  │  sauldeleon.com                      │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

- Background: cover image blurred + darkened overlay, or solid brand gradient if no cover
- Title: white, bold, Inter font, max 2 lines (clamp)
- Category: colored badge (top-left of card)
- URL: bottom-right, small, muted

## Integration with SEO metadata

In `app/[lng]/blog/[id]/[slug]/page.next.tsx`:

```ts
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!;
const ogImageUrl = new URL('/og', baseUrl);
ogImageUrl.searchParams.set('title', post.title);
if (post.coverImage) ogImageUrl.searchParams.set('cover', post.coverImage);
if (post.category) ogImageUrl.searchParams.set('category', post.category);

return {
  openGraph: {
    images: [{ url: ogImageUrl.toString(), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogImageUrl.toString()],
  },
};
```

## Tasks

- [ ] Create `app/og/route.tsx` — `ImageResponse` handler
- [ ] Create `app/og/OgImageTemplate.tsx` — JSX layout for OG image (inline styles only — `next/og` limitation)
- [ ] Load Inter font via `fetch` from Google Fonts in route handler
- [ ] Handle missing/broken cover gracefully (fallback to gradient)
- [ ] Title truncation: CSS `-webkit-line-clamp: 2`
- [ ] Add cache headers: `Cache-Control: public, max-age=31536000, immutable` (URL includes content hash via title)
- [ ] **Replace** the placeholder `og:image` set in #07 — update `generateMetadata` in both listing + post pages to use `/og?title=...` route instead of `post.coverImage` directly
- [ ] Test with og:debugger (Facebook Sharing Debugger or opengraph.xyz)

## Acceptance Criteria

- [ ] `GET /og?title=Test+Post` returns a 1200×630 PNG
- [ ] Title text appears correctly
- [ ] Cover image appears as blurred background when provided
- [ ] Falls back to gradient when no cover
- [ ] `og:image` in post page HTML points to `/og` route with correct params
- [ ] Image renders correctly in og:debugger
- [ ] 100% test coverage on route handler

## Notes

- `next/og` runs on Edge runtime — keep template simple (no styled-components, no complex deps)
- Font must be fetched at runtime in the route handler — not importable
- Cloudinary cloud name for cover images: `dmpaja1mw`
