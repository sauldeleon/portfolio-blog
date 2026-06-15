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

  const payloads = (
    await Promise.all(
      subscribers.map(async (subscriber) => {
        const locale = subscriber.locale
        const postTranslation = translations[locale] ?? translations['en']
        if (!postTranslation) return null

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
            greeting: t('notification.greeting', { name: subscriber.name }),
            teaser: t('notification.teaser'),
            heading: t('notification.heading'),
            buttonLabel: t('notification.buttonLabel'),
            footerText: t('notification.footerText'),
            unsubscribeText: t('notification.unsubscribeText'),
          }),
        )

        return {
          from: FROM_EMAIL,
          to: subscriber.email,
          subject: t('notification.subject', { title: postTranslation.title }),
          html,
        }
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => p !== null)

  if (payloads.length === 0) return

  const BATCH_SIZE = 100
  for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
    const chunk = payloads.slice(i, i + BATCH_SIZE)
    const { error } = await resend.batch.send(chunk)
    if (error) {
      logger.error(
        { error, postId },
        'sendNewPostNotifications: Resend batch send failed',
      )
    }
  }
}
