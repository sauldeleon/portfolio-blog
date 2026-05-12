# [SEO] RSS Feed + JSON-LD Article Structured Data

**Labels:** `blog`, `seo`  
**Milestone:** SEO  
**Depends on:** #07 (SEO meta + sitemap)

## Context

Two discovery features: RSS feed for readers/aggregators, and JSON-LD Article schema for rich results in Google Search.

---

## 1. RSS Feed — `/feed.xml`

Standard RSS 2.0 feed of published posts (most recent 20).

### Endpoint

`app/feed.xml/route.ts` — returns `application/rss+xml`

```ts
export async function GET() {
  const posts = await getPosts({ status: 'published', limit: 20 })
  const rss = generateRSS(posts.data)
  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
```

### Feed structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Saúl de León — Blog</title>
    <link>https://sauldeleon.com/en/blog</link>
    <description>...</description>
    <language>en</language>
    <atom:link href="https://sauldeleon.com/feed.xml" rel="self" type="application/rss+xml"/>
    <item>
      <title>Post title</title>
      <link>https://sauldeleon.com/en/blog/[id]/[slug]</link>
      <guid isPermaLink="true">...</guid>
      <description>excerpt</description>
      <pubDate>RFC 822 date</pubDate>
      <category>category</category>
    </item>
    ...
  </channel>
</rss>
```

### Tasks

- [ ] Create `app/feed.xml/route.ts` — use `process.env.NEXT_PUBLIC_SITE_URL` as base URL for all links
- [ ] Create `lib/rss/generateRSS.ts` — pure function, testable
- [ ] Add `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` to `app/layout.tsx` (root layout, inside `<head>` metadata)
- [ ] Add to sitemap (optional)

---

## 2. JSON-LD Article Structured Data

On each post detail page, inject `Article` schema for Google rich results.

### Schema

```ts
// lib/seo/generateArticleJsonLd.ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

export function generateArticleJsonLd(post: PublicPost, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ?? undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Person',
      name: 'Saúl de León',
      url: siteUrl,
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: post.tags.join(', '),
  }
}
```

Inject via Next.js `generateMetadata` or `<script type="application/ld+json">` in page.

### Tasks

- [ ] Create `lib/seo/generateArticleJsonLd.ts`
- [ ] Inject JSON-LD in `app/[lng]/blog/[id]/[slug]/page.next.tsx`

---

## Acceptance Criteria

- [ ] `GET /feed.xml` returns valid RSS 2.0 (validate with W3C RSS validator)
- [ ] Feed contains last 20 published posts
- [ ] `<link rel="alternate">` tag present in site `<head>`
- [ ] Post pages have `<script type="application/ld+json">` with Article schema
- [ ] JSON-LD validates at Google Rich Results Test
- [ ] 100% test coverage on `generateRSS` and `generateArticleJsonLd`
