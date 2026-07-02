import axios from 'axios'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@web/lib/api/parseRequest'
import { parseCanyonWaypointsGpx } from '@web/lib/cards'
import { logger } from '@web/lib/logger'

const querySchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), 'Only http(s) URLs allowed'),
})

export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({ url: searchParams.get('url') })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid GPX URL' }, { status: 400 })
  }

  let text: string
  try {
    const res = await axios.get<string>(parsed.data.url, {
      responseType: 'text',
    })
    text = res.data
  } catch (err) {
    logger.error(err, 'Failed to fetch GPX canyon waypoints')
    return NextResponse.json({ error: 'Failed to fetch GPX' }, { status: 502 })
  }

  return NextResponse.json({ data: parseCanyonWaypointsGpx(text) })
}
