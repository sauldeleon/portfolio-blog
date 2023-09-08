import { MetadataRoute } from 'next'

import { publicUrl } from '@web/utils/url/generateUrl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/*/contact/'],
    },
    sitemap: `${publicUrl('/sitemap.xml')}`,
    host: `${publicUrl('')}`,
  }
}
