import { NextResponse } from 'next/server'

import { requireAuth } from '@web/lib/api/parseRequest'
import { getSubscriptionsAdmin } from '@web/lib/db/queries/subscriptions'
import { logger } from '@web/lib/logger'

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  try {
    const subscriptions = await getSubscriptionsAdmin()
    return NextResponse.json({ subscriptions })
  } catch (err) {
    logger.error(err, 'GET /api/subscriptions failed')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
