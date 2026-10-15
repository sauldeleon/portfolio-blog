import axios from 'axios'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@web/lib/api/parseRequest'
import { parseGpx } from '@web/lib/cards'
import { nameLandmarksFromOsm } from '@web/lib/cards/osmLandmarks'
import { logger } from '@web/lib/logger'

const querySchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), 'Only http(s) URLs allowed'),
  /** Look up summit and col names on OpenStreetMap (route cards only). */
  places: z.literal('1').optional(),
})

export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { searchParams } = new URL(request.url)
  const parsed = querySchema.safeParse({
    url: searchParams.get('url'),
    places: searchParams.get('places') ?? undefined,
  })
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
    logger.error(err, 'Failed to fetch GPX')
    return NextResponse.json({ error: 'Failed to fetch GPX' }, { status: 502 })
  }

  let data
  try {
    data = parseGpx(text)
  } catch {
    return NextResponse.json(
      { error: 'Could not parse GPX file' },
      { status: 422 },
    )
  }
  if (parsed.data.places) {
    data = { ...data, landmarks: await nameLandmarksFromOsm(data.landmarks) }
  }
  return NextResponse.json({ data })
}
