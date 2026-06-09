import { render } from '@react-email/components'

import { logger } from '@web/lib/logger'
import { getSiteUrl } from '@web/utils/url/generateUrl'

import { resend } from './resend'
import { ConfirmSubscriptionEmail } from './templates/ConfirmSubscription'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

export interface SendConfirmationEmailParams {
  to: string
  name: string
  token: string
  locale: 'en' | 'es'
  translations: {
    subject: string
    previewText: string
    heading: string
    body: string
    buttonLabel: string
    footerText: string
    unsubscribeText: string
  }
}

export async function sendConfirmationEmail({
  to,
  name,
  token,
  locale,
  translations,
}: SendConfirmationEmailParams): Promise<void> {
  const siteUrl = getSiteUrl()
  const confirmUrl = `${siteUrl}/${locale}/subscribe/confirmed?token=${token}`
  const unsubscribeUrl = `${siteUrl}/${locale}/subscribe/unsubscribed?token=${token}`
  const blogImageUrl = siteUrl ? `${siteUrl}/og/blog.jpg` : undefined

  const html = await render(
    ConfirmSubscriptionEmail({
      name,
      confirmUrl,
      unsubscribeUrl,
      siteUrl,
      blogImageUrl,
      previewText: translations.previewText,
      heading: translations.heading,
      body: translations.body,
      buttonLabel: translations.buttonLabel,
      footerText: translations.footerText,
      unsubscribeText: translations.unsubscribeText,
    }),
  )

  if (!resend) {
    return
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: translations.subject,
    html,
  })

  if (error) {
    logger.error({ error, to }, 'sendConfirmationEmail: Resend rejected send')
    throw new Error(`Resend error: ${error.message}`)
  }
}
