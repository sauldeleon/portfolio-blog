import { getCldImageUrl } from 'next-cloudinary'

import type { PublicPost } from '@web/lib/db/queries/posts'
import { getSiteUrl } from '@web/utils/url/generateUrl'

export function generateArticleJsonLd(
  post: PublicPost,
  lng: string,
  url: string,
) {
  const siteUrl = getSiteUrl()
  const image = post.coverImage
    ? getCldImageUrl({
        src: post.coverImage,
        width: 1200,
        height: 630,
        crop: 'fill',
      })
    : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image,
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
