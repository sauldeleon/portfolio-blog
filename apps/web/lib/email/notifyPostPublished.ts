import { getPostTranslations } from '@web/lib/db/queries/posts'
import { sendNewPostNotifications } from '@web/lib/email/sendNewPostNotifications'
import { logger } from '@web/lib/logger'

interface PostForNotification {
  id: string
  postNumber: number
  coverImage: string | null
  category: string
  tags: string[]
  seriesId: string | null
  seriesOrder: number | null
}

export async function notifyPostPublished(
  post: PostForNotification,
  logContext: string,
): Promise<void> {
  try {
    const allTranslations = await getPostTranslations(post.id)
    const translationsByLocale: Partial<
      Record<'en' | 'es', { title: string; excerpt: string; slug: string }>
    > = {}
    for (const t of allTranslations) {
      translationsByLocale[t.locale as 'en' | 'es'] = {
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
      }
    }
    sendNewPostNotifications({
      postId: post.id,
      postNumber: post.postNumber,
      translations: translationsByLocale,
      coverImage: post.coverImage,
      category: post.category,
      tags: post.tags,
      seriesId: post.seriesId,
      seriesOrder: post.seriesOrder,
    }).catch((err) => logger.error(err, logContext))
  } catch (err) {
    logger.error(err, logContext)
  }
}
