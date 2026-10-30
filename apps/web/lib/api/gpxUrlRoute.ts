import axios from 'axios'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { logger } from '@web/lib/logger'

import { requireAuth } from './parseRequest'

/** A GPX host that hangs must not hang the function with it. */
export const GPX_FETCH_TIMEOUT_MS = 8_000

const querySchema = z.object({
  url: z
    .string()
    .url()
    .refine((u) => /^https?:\/\//i.test(u), 'Only http(s) URLs allowed'),
})

/**
 * A `GET` handler that fetches the GPX at `?url=` and answers with
 * `parse(text)` as `data`: 400 for a bad url, 502 when the GPX cannot be
 * fetched, 422 when it cannot be parsed. `label` names the data in the logs.
 */
export function gpxUrlRoute<T>(parse: (gpx: string) => T, label: string) {
  return async function GET(request: Request) {
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
        timeout: GPX_FETCH_TIMEOUT_MS,
      })
      text = res.data
    } catch (err) {
      logger.error(err, `Failed to fetch ${label}`)
      return NextResponse.json(
        { error: 'Failed to fetch GPX' },
        { status: 502 },
      )
    }

    try {
      return NextResponse.json({ data: parse(text) })
    } catch {
      return NextResponse.json(
        { error: 'Could not parse GPX file' },
        { status: 422 },
      )
    }
  }
}
