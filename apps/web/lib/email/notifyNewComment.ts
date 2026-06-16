import { render } from '@react-email/components'
import React from 'react'

import { logger } from '@web/lib/logger'
import { getSiteUrl } from '@web/utils/url/generateUrl'

import { resend } from './resend'
import { NewCommentEmail } from './templates/NewCommentEmail'

/* istanbul ignore next */
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

export interface NotifyNewCommentParams {
  username: string
  body: string
  postTitle: string
  postNumber: number
  postSlug: string
  postLng: string
}

export async function notifyNewComment({
  username,
  body,
  postTitle,
  postNumber,
  postSlug,
  postLng,
}: NotifyNewCommentParams): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!resend || !adminEmail) return

  const siteUrl = getSiteUrl()
  const postUrl = `${siteUrl}/${postLng}/blog/${postNumber}/${postSlug}`
  const adminUrl = `${siteUrl}/admin/comments`

  try {
    const html = await render(
      React.createElement(NewCommentEmail, {
        username,
        body,
        postTitle,
        postUrl,
        adminUrl,
        siteUrl,
      }),
    )

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New comment from ${username} on "${postTitle}"`,
      html,
    })

    if (error) {
      logger.error({ error }, 'notifyNewComment: Resend send failed')
    }
  } catch (err) {
    logger.error(err, 'notifyNewComment: failed to send email')
  }
}
