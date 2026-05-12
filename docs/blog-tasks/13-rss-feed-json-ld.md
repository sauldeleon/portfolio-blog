# [SEO] RSS Feed + JSON-LD Article Structured Data

**Labels:** `blog`, `seo`  
**Milestone:** SEO  
**Depends on:** #07 (SEO meta + sitemap)

## Context

Two discovery features: RSS feeds per locale for readers/aggregators, and JSON-LD Article schema for rich results in Google Search. Two separate feeds (EN + ES) because titles, slugs, and excerpts are locale-specific.

---

## 1. RSS Feeds — `/feed.xml` + `/feed.es.xml`

Standard RSS 2.0 feeds of published posts (most recent 20), one per locale.

### Endpoints

- `app/feed.xml/route.ts` — English feed
- `app/feed.es.xml/route.ts` — Spanish feed

```ts
// app/feed.xml/route.ts
export async function GET() {
  const posts = await getPosts({ status: 'published', limit: 20, locale: 'en' })
  const rss = generateRSS(posts.data, 'en')
  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}

// app/feed.es.xml/route.ts — same but locale: 'es'
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
      <title>Post title (locale)</title>
      <link>https://sauldeleon.com/en/blog/[id]/[locale-slug]</link>
      <guid isPermaLink="true">...</guid>
      <description>excerpt (locale)</description>
      <pubDate>RFC 822 date</pubDate>
      <category>category</category>
    </item>
    ...
  </channel>
</rss>
```

### Tasks

- [ ] Create `app/feed.xml/route.ts` — EN feed, uses `process.env.NEXT_PUBLIC_SITE_URL` as base URL
- [ ] Create `app/feed.xml/route.spec.ts` — test content-type header, post count, EN slugs in URLs
- [ ] Create `app/feed.es.xml/route.ts` — ES feed, same generator with `locale: 'es'`
- [ ] Create `app/feed.es.xml/route.spec.ts` — test ES slugs in URLs, `<language>es</language>`
- [ ] Create `lib/rss/generateRSS.ts` — pure function accepting `(posts: PublicPost[], locale: 'en' | 'es')`, testable
- [ ] Create `lib/rss/generateRSS.spec.ts` — test valid RSS XML output, item fields, both locales
- [ ] Add `<link rel="alternate" type="application/rss+xml" title="EN" href="/feed.xml">` to `app/layout.tsx`
- [ ] Add `<link rel="alternate" type="application/rss+xml" title="ES" href="/feed.es.xml">` to `app/layout.tsx`

---

## 2. JSON-LD Article Structured Data

On each post detail page, inject `Article` schema for Google rich results. Title, description, and URL are locale-specific.

### Schema

```ts
// lib/seo/generateArticleJsonLd.ts
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

export function generateArticleJsonLd(post: PublicPost, lng: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title, // locale-specific title
    description: post.excerpt, // locale-specific excerpt
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
    inLanguage: lng === 'en' ? 'en-US' : 'es-ES',
    keywords: post.tags.join(', '),
  }
}
```

Inject via `<script type="application/ld+json">` in page.

### Tasks

- [ ] Create `lib/seo/generateArticleJsonLd.ts`
- [ ] Create `lib/seo/generateArticleJsonLd.spec.ts` — test schema shape, locale-specific fields, inLanguage value
- [ ] Inject JSON-LD in `app/[lng]/blog/[id]/[slug]/page.next.tsx`

---

## Acceptance Criteria

- [ ] `GET /feed.xml` returns valid RSS 2.0 with EN titles and EN slugs in URLs
- [ ] `GET /feed.es.xml` returns valid RSS 2.0 with ES titles and ES slugs in URLs
- [ ] Both feeds contain last 20 published posts
- [ ] `<link rel="alternate">` tags for both feeds present in site `<head>`
- [ ] Post pages have `<script type="application/ld+json">` with Article schema
- [ ] JSON-LD uses locale-specific `headline`, `description`, and `inLanguage`
- [ ] JSON-LD validates at Google Rich Results Test
- [ ] 100% test coverage on `generateRSS` and `generateArticleJsonLd`
