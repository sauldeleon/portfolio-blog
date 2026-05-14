import { MetadataRoute } from 'next'

import { languages } from '@web/i18n/settings'
import { getPublishedPosts } from '@web/lib/db/queries/posts'
import { Locale } from '@web/lib/db/schema'
import { cartesianMerge } from '@web/utils/array/cartesianMerge'
import { publicUrl } from '@web/utils/url/generateUrl'

const LAST_MODIFIED =
  process.env.NEXT_PUBLIC_BUILD_DATE ?? '2026-05-11T00:00:00.000Z'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const languagePaths = languages.map((lng) => `/${lng}`)
  const appPaths = ['/', '/contact/', '/experience/', '/portfolio/']
  const availableRoutes = cartesianMerge(languagePaths, appPaths)
  const staticRoutes = availableRoutes.map((route) => ({
    url: `${publicUrl(route)}`,
    lastModified: LAST_MODIFIED,
  }))

  const blogRoutes: MetadataRoute.Sitemap = []
  try {
    const postsByLocale = await Promise.all(
      languages.map((lng) => getPublishedPosts(lng as Locale)),
    )
    for (let i = 0; i < languages.length; i++) {
      const lng = languages[i]
      for (const post of postsByLocale[i]) {
        blogRoutes.push({
          url: publicUrl(`/${lng}/blog/${post.id}/${post.slug}`),
          lastModified: post.updatedAt ?? LAST_MODIFIED,
        })
      }
    }
  } catch {
    // DB unavailable at build time — skip blog routes
  }

  return [...staticRoutes, ...blogRoutes]
}
