import type { PublicPost } from '@web/lib/db/queries/posts'

export function generateArticleJsonLd(
  post: PublicPost,
  lng: string,
  url: string,
) {
  const siteUrl = process.env.BASE_URL ?? ''
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
    inLanguage: lng === 'en' ? 'en-US' : 'es-ES',
    keywords: post.tags.join(', '),
  }
}
