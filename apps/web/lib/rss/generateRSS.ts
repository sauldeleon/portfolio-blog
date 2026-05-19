import type { PublicPost } from '@web/lib/db/queries/posts'

export function generateRSS(posts: PublicPost[], locale: 'en' | 'es'): string {
  const baseUrl = process.env.BASE_URL ?? ''
  const feedUrl =
    locale === 'en' ? `${baseUrl}/feed.xml` : `${baseUrl}/feed.es.xml`
  const blogUrl = `${baseUrl}/${locale}/blog`

  const items = posts
    .map((post) => {
      const url = `${baseUrl}/${locale}/blog/${post.postNumber}/${post.slug}`
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : ''
      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.category}]]></category>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Saúl de León — Blog</title>
    <link>${blogUrl}</link>
    <description>Front-end engineering articles by Saúl de León</description>
    <language>${locale}</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}
