import { MetadataRoute } from 'next'

import { publicUrl } from '@web/utils/url/generateUrl'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/contact', '/experience', '/portfolio'].map((route) => ({
    url: `${publicUrl(route)}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes]
}
