# [SEO] Per-Post Meta, OpenGraph, Sitemap, Canonical URLs

**Labels:** `blog`, `seo`  
**Milestone:** SEO  
**Depends on:** #05 (listing page), #06 (post detail)  
**Blocks:** #13 (RSS + JSON-LD), #14 (OG images)

## Context

Each blog page needs proper SEO metadata. Sitemap must include blog posts in both locales. Each locale has its own slug — `hreflang` alternates must use the correct locale-specific slug. Canonical points to the EN URL.

## Metadata per route

### Listing `/[lng]/blog`

```ts
// app/[lng]/blog/page.next.tsx
export async function generateMetadata({ params }) {
  return {
    title: t('blog.meta.title'), // e.g. "Blog — Saúl de León"
    description: t('blog.meta.description'),
    alternates: {
      canonical: `/en/blog`,
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

Each locale has a different slug — `hreflang` must use the locale-specific slug for each alternate.

```ts
export async function generateMetadata({ params }) {
  const { lng, id } = await params
  // Fetch both translations to get both slugs for hreflang
  const [enTranslation, esTranslation] = await Promise.all([getPostById(id, 'en'), getPostById(id, 'es')])
  const post = lng === 'en' ? enTranslation : esTranslation
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!

  return {
    title: `${post.title} — Saúl de León`,
    description: post.excerpt,
    alternates: {
      canonical: `${baseUrl}/en/blog/${id}/${enTranslation.slug}`,
      languages: {
        en: `${baseUrl}/en/blog/${id}/${enTranslation.slug}`,
        es: `${baseUrl}/es/blog/${id}/${esTranslation.slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/${lng}/blog/${id}/${post.slug}`,
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

Update `app/sitemap.ts` to include blog posts in both locales with locale-specific slugs:

```ts
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!

// Fetch both locale translations for each post
const [enPosts, esPosts] = await Promise.all([getPosts({ status: 'published', limit: 1000, locale: 'en' }), getPosts({ status: 'published', limit: 1000, locale: 'es' })])

// Map each locale's posts to their slug-correct URL
const postRoutes = [
  ...enPosts.data.map((post) => ({
    url: `${baseUrl}/en/blog/${post.id}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  })),
  ...esPosts.data.map((post) => ({
    url: `${baseUrl}/es/blog/${post.id}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  })),
]

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
  - Fetch both locale translations to build correct `hreflang` alternates with locale-specific slugs
  - Set `og:image` to `post.coverImage` here as a placeholder — **#14 will replace this with the `/og` dynamic route**
- [ ] Add i18n keys: `blog.meta.title`, `blog.meta.description`
- [ ] Update `app/sitemap.ts` to include blog post routes for both locales — each locale uses its own slug
- [ ] Add `<link rel="alternate" hreflang="...">` via Next.js `alternates` API — use locale-specific slug per alternate
- [ ] Verify `og:locale` correct per `[lng]` segment (`en_US` / `es_ES`)
- [ ] Preview metadata in browser devtools + og debugger
- [ ] Create `app/sitemap.spec.ts` — test sitemap includes both locale URLs with correct slugs, excludes drafts

## Acceptance Criteria

- [ ] `/en/blog/[id]/[slug-en]` has correct `<title>`, `<meta description>`, `og:*` tags
- [ ] `hreflang` for EN post points to EN slug, `hreflang` for ES points to ES slug
- [ ] `og:type = article` on post pages, `og:type = website` on listing
- [ ] Sitemap includes all published posts in both locales with correct locale slug in URL
- [ ] Sitemap validates at Google Search Console sitemap tester
- [ ] 100% test coverage on sitemap generator function

## Notes

- English URL is canonical even on `/es/` pages (one post, two locale frontends)
- `hreflang` alternates must use locale-specific slugs — not the same slug for both locales
- `og:locale` → `en_US` for `/en/`, `es_ES` for `/es/`
- Draft posts excluded from sitemap
