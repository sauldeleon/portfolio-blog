import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@web/lib/api/parseRequest'
import { updateSubscriptionById } from '@web/lib/db/queries/subscriptions'
import { logger } from '@web/lib/logger'
import {
  subscriptionLocaleSchema,
  subscriptionNameSchema,
} from '@web/lib/subscriptions/schema'

const patchSchema = z
  .object({
    enabled: z.boolean().optional(),
    name: subscriptionNameSchema.optional(),
    locale: subscriptionLocaleSchema.optional(),
  })
  .refine((patch) => Object.keys(patch).length > 0, {
    message: 'Nothing to update',
  })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  try {
    const subscription = await updateSubscriptionById(id, parsed.data)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ subscription })
  } catch (err) {
    logger.error(err, 'PATCH /api/subscriptions/[id] failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
