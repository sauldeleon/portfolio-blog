import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  createSubscription,
  getSubscriptionByEmail,
} from '@web/lib/db/queries/subscriptions'
import { sendConfirmationEmail } from '@web/lib/email/sendConfirmationEmail'
import { logger } from '@web/lib/logger'
import { ratelimit } from '@web/lib/ratelimit'
import { verifyTurnstile } from '@web/lib/turnstile/verify'

const subscribeSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  turnstileToken: z.string().min(1),
  honeypot: z.string().optional(),
  locale: z.enum(['en', 'es']).default('en'),
  translations: z.object({
    subject: z.string(),
    previewText: z.string(),
    heading: z.string(),
    body: z.string(),
    buttonLabel: z.string(),
    footerText: z.string(),
    unsubscribeText: z.string(),
  }),
})

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'

  if (ratelimit) {
    const { success } = await ratelimit.limit(`subscribe:${ip}`)
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

  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const { name, email, turnstileToken, honeypot, locale, translations } =
    parsed.data

  if (honeypot) {
    return NextResponse.json({ ok: true })
  }

  const turnstileOk = await verifyTurnstile(turnstileToken)
  if (!turnstileOk) {
    return NextResponse.json(
      { error: 'Captcha verification failed' },
      { status: 422 },
    )
  }

  try {
    const existing = await getSubscriptionByEmail(email)
    if (existing && existing.status !== 'unsubscribed') {
      return NextResponse.json({ ok: true, alreadySubscribed: true })
    }

    const subscription =
      existing?.status === 'unsubscribed'
        ? existing
        : await createSubscription({ email, name, locale })

    await sendConfirmationEmail({
      to: email,
      name,
      token: subscription.token,
      locale,
      translations,
    })

    logger.info({ email }, 'POST /api/subscribe: subscription created')
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (err) {
    logger.error(err, 'POST /api/subscribe: failed')
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
