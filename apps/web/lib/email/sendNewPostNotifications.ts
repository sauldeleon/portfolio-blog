import { render } from '@react-email/components'

import { getServerTranslation } from '@web/i18n/server'
import { getSeriesTranslationsById } from '@web/lib/db/queries/series'
import { getActiveSubscribers } from '@web/lib/db/queries/subscriptions'
import { logger } from '@web/lib/logger'
import { getSiteUrl } from '@web/utils/url/generateUrl'

import { resend } from './resend'
import { NewPostEmail } from './templates/NewPostEmail'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

export interface PostTranslationData {
  title: string
  excerpt: string
  slug: string
}

export interface SendNewPostNotificationsParams {
  postId: string
  postNumber: number
  translations: Partial<Record<'en' | 'es', PostTranslationData>>
  coverImage?: string | null
  category?: string | null
  tags?: string[]
  seriesId?: string | null
  seriesOrder?: number | null
}

function toCoverImageUrl(
  publicId: string | null | undefined,
): string | undefined {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!cloudName || !publicId) return undefined
  const encodedId = publicId.split('/').map(encodeURIComponent).join('/')
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,w_560,h_220/f_auto,q_auto/${encodedId}`
}

export async function sendNewPostNotifications({
  postId,
  postNumber,
  translations,
  coverImage,
  category,
  tags,
  seriesId,
  seriesOrder,
}: SendNewPostNotificationsParams): Promise<void> {
  if (!resend) return

  const subscribers = await getActiveSubscribers()
  if (subscribers.length === 0) return

  const siteUrl = getSiteUrl()
  const coverImageUrl = toCoverImageUrl(coverImage)

  let seriesTitlesByLocale: Map<string, string> | null = null
  if (seriesId) {
    const rows = await getSeriesTranslationsById(seriesId)
    seriesTitlesByLocale = new Map(rows.map((r) => [r.locale, r.title]))
  }

  await Promise.allSettled(
    subscribers.map(async (subscriber) => {
      const locale = subscriber.locale
      const postTranslation = translations[locale] ?? translations['en']
      if (!postTranslation) return

      const { t } = await getServerTranslation({
        ns: 'subscribe',
        language: locale,
      })

      const seriesTitle = seriesTitlesByLocale
        ? (seriesTitlesByLocale.get(locale) ?? seriesTitlesByLocale.get('en'))
        : undefined

      const postUrl = `${siteUrl}/${locale}/blog/${postNumber}/${postTranslation.slug}`
      const unsubscribeUrl = `${siteUrl}/${locale}/subscribe/unsubscribed?token=${subscriber.token}`

      const html = await render(
        NewPostEmail({
          postTitle: postTranslation.title,
          postExcerpt: postTranslation.excerpt,
          postUrl,
          unsubscribeUrl,
          siteUrl,
          coverImageUrl,
          category: category ?? undefined,
          tags,
          seriesTitle,
          seriesOrder,
          previewText: t('notification.previewText'),
          teaser: t('notification.teaser' as Parameters<typeof t>[0]),
          heading: t('notification.heading' as Parameters<typeof t>[0]),
          buttonLabel: t('notification.buttonLabel' as Parameters<typeof t>[0]),
          footerText: t('notification.footerText' as Parameters<typeof t>[0]),
          unsubscribeText: t(
            'notification.unsubscribeText' as Parameters<typeof t>[0],
          ),
        }),
      )

      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: subscriber.email,
        subject: t('notification.subject' as Parameters<typeof t>[0], {
          title: postTranslation.title,
        }),
        html,
      })

      if (error) {
        logger.error(
          { error, email: subscriber.email, postId },
          'sendNewPostNotifications: Resend rejected send',
        )
      }
    }),
  )
}
