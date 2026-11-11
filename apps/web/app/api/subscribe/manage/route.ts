import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getClientIp } from '@web/lib/api/getClientIp'
import { updateSubscriptionByToken } from '@web/lib/db/queries/subscriptions'
import { logger } from '@web/lib/logger'
import { ratelimit } from '@web/lib/ratelimit'
import { verifyManageLink } from '@web/lib/subscriptions/manageLink'
import { subscriptionDetailsSchema } from '@web/lib/subscriptions/schema'

const manageSchema = subscriptionDetailsSchema.extend({
  token: z.string().min(1),
  expires: z.string().min(1),
  signature: z.string().min(1),
})

/**
 * Lets a subscriber change their name and email language from the link in
 * their emails. The link is signed and expires after 30 days (the
 * unsubscribe link, by contrast, never expires).
 */
export async function PATCH(request: NextRequest) {
  if (ratelimit) {
    const { success } = await ratelimit.limit(
      `subscribe-manage:${getClientIp(request)}`,
    )
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = manageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { token, expires, signature, name, locale } = parsed.data

  const linkStatus = verifyManageLink({ token, expires, signature })
  if (linkStatus === 'expired') {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 })
  }
  if (linkStatus === 'invalid') {
    return NextResponse.json({ error: 'Invalid link' }, { status: 403 })
  }

  try {
    const subscription = await updateSubscriptionByToken(token, {
      name,
      locale,
    })
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({
      subscription: { name: subscription.name, locale: subscription.locale },
    })
  } catch (err) {
    logger.error(err, 'PATCH /api/subscribe/manage failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
