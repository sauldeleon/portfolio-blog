# [SEO] Per-Post Meta, OpenGraph, Sitemap, Canonical URLs

**Labels:** `blog`, `seo`  
**Milestone:** SEO  
**Depends on:** #05 (listing page), #06 (post detail)  
**Blocks:** #13 (RSS + JSON-LD), #14 (OG images)

## Context

Each blog page needs proper SEO metadata. Sitemap must include blog posts. Locale variants must have canonical + `hreflang` links.

## Metadata per route

### Listing `/[lng]/blog`

```ts
// app/[lng]/blog/page.next.tsx
export async function generateMetadata({ params }) {
  return {
    title: t('blog.meta.title'), // e.g. "Blog — Saúl de León"
    description: t('blog.meta.description'),
    alternates: {
      canonical: `/${lng}/blog`,
      languages: { en: '/en/blog', es: '/es/blog' },
    },
    openGraph: {
      title: t('blog.meta.title'),
      description: t('blog.meta.description'),
      url: `/${lng}/blog`,
      type: 'website',
    },
  }
}
```

### Post Detail `/[lng]/blog/[id]/[slug]`

```ts
export async function generateMetadata({ params }) {
  const post = await getPost(params.id)
  return {
    title: `${post.title} — Saúl de León`,
    description: post.excerpt,
    alternates: {
      canonical: `/en/blog/${post.id}/${post.slug}`, // en as canonical
      languages: {
        en: `/en/blog/${post.id}/${post.slug}`,
        es: `/es/blog/${post.id}/${post.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/${lng}/blog/${post.id}/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : [],
    },
  }
}
```

## Sitemap

Update `app/sitemap.ts` to include blog posts:

```ts
// Existing static routes +
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!
const posts = await getPosts({ status: 'published', limit: 1000 })
const postRoutes = ['en', 'es'].flatMap((lng) =>
  posts.data.map((post) => ({
    url: `${baseUrl}/${lng}/blog/${post.id}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  })),
)
const blogIndexRoutes = ['en', 'es'].map((lng) => ({
  url: `${baseUrl}/${lng}/blog`,
  lastModified: new Date(),
  changeFrequency: 'daily',
  priority: 0.8,
}))
```

## Tasks

- [ ] Add `generateMetadata` to `app/[lng]/blog/page.next.tsx`
- [ ] Add `generateMetadata` to `app/[lng]/blog/[id]/[slug]/page.next.tsx`
  - Set `og:image` to `post.coverImage` here as a placeholder — **#14 will replace this with the `/og` dynamic route**
- [ ] Add i18n keys: `blog.meta.title`, `blog.meta.description`
- [ ] Update `app/sitemap.ts` to include blog post routes + listing routes — use `process.env.NEXT_PUBLIC_SITE_URL` as base URL
- [ ] Add `<link rel="alternate" hreflang="...">` via Next.js `alternates` API
- [ ] Verify `og:locale` correct per `[lng]` segment (`en_US` / `es_ES`)
- [ ] Preview metadata in browser devtools + og debugger

## Acceptance Criteria

- [ ] `/en/blog/[id]/[slug]` has correct `<title>`, `<meta description>`, `og:*` tags
- [ ] `og:type = article` on post pages, `og:type = website` on listing
- [ ] Sitemap includes all published posts in both locales
- [ ] `hreflang` links present on both en/es variants
- [ ] Sitemap validates at Google Search Console sitemap tester
- [ ] 100% test coverage on sitemap generator function

## Notes

- Use English post URL as canonical even on `/es/` pages (single post, two locale frontends)
- `og:locale` → `en_US` for `/en/`, `es_ES` for `/es/`
- Draft posts excluded from sitemap
