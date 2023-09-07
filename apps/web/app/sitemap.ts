import { MetadataRoute } from 'next'

import { languages } from '@web/i18n/settings'
import { cartesianMerge } from '@web/utils/array/cartesianMerge'
import { publicUrl } from '@web/utils/url/generateUrl'

export default function sitemap(): MetadataRoute.Sitemap {
  const languagePaths = languages.map((lng) => `/${lng}`)
  const appPaths = ['/', '/contact', '/experience', '/portfolio', '/blog']
  const availableRoutes = cartesianMerge(languagePaths, appPaths)
  const routes = availableRoutes.map((route) => ({
    url: `${publicUrl(route)}`,
    lastModified: new Date().toISOString(),
  }))

  return [...routes]
}
