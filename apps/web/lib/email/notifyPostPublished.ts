import axios, { isAxiosError } from 'axios'

import { getPostTranslations } from '@web/lib/db/queries/posts'
import { sendNewPostNotifications } from '@web/lib/email/sendNewPostNotifications'
import { logger } from '@web/lib/logger'
import { getSiteUrl } from '@web/utils/url/generateUrl'

interface PostForNotification {
  id: string
  postNumber: number
  coverImage: string | null
  category: string
  tags: string[]
  seriesId: string | null
  seriesOrder: number | null
}

type TranslationEntry = { title: string; excerpt: string; slug: string }

export async function notifyPostPublished(
  post: PostForNotification,
  logContext: string,
): Promise<void> {
  try {
    const siteUrl = getSiteUrl()

    if (siteUrl.includes('localhost')) {
      logger.warn(
        { logContext },
        'notifyPostPublished: skipping notifications on localhost',
      )
      return
    }

    const allTranslations = await getPostTranslations(post.id)
    const translationsByLocale: Partial<Record<'en' | 'es', TranslationEntry>> =
      {}
    for (const t of allTranslations) {
      translationsByLocale[t.locale as 'en' | 'es'] = {
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
      }
    }

    for (const [locale, translation] of Object.entries(
      translationsByLocale,
    ) as [string, TranslationEntry][]) {
      const url = `${siteUrl}/${locale}/blog/${post.postNumber}/${translation.slug}`
      try {
        await axios.head(url)
      } catch (err) {
        // Reachable but non-2xx → skip quietly; network/other errors bubble
        // up to the outer handler so they're logged as errors.
        if (isAxiosError(err) && err.response) {
          logger.warn(
            { url, status: err.response.status, logContext },
            'notifyPostPublished: post page not reachable, skipping notifications',
          )
          return
        }
        throw err
      }
    }

    await sendNewPostNotifications({
      postId: post.id,
      postNumber: post.postNumber,
      translations: translationsByLocale,
      coverImage: post.coverImage,
      category: post.category,
      tags: post.tags,
      seriesId: post.seriesId,
      seriesOrder: post.seriesOrder,
    })
  } catch (err) {
    logger.error(err, logContext)
  }
}
