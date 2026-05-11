import { MetadataRoute } from 'next'

import { languages } from '@web/i18n/settings'
import { cartesianMerge } from '@web/utils/array/cartesianMerge'
import { publicUrl } from '@web/utils/url/generateUrl'

const LAST_MODIFIED =
  process.env.NEXT_PUBLIC_BUILD_DATE ?? '2026-05-11T00:00:00.000Z'

export default function sitemap(): MetadataRoute.Sitemap {
  const languagePaths = languages.map((lng) => `/${lng}`)
  const appPaths = ['/', '/contact/', '/experience/', '/portfolio/']
  const availableRoutes = cartesianMerge(languagePaths, appPaths)
  const routes = availableRoutes.map((route) => ({
    url: `${publicUrl(route)}`,
    lastModified: LAST_MODIFIED,
  }))

  return [...routes]
}
