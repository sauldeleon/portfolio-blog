import { NextResponse } from 'next/server'
import { z } from 'zod'

import { parseAuthRequest } from '@web/lib/api/parseRequest'
import { nameLandmarksFromOsm } from '@web/lib/cards/osmLandmarks'

const landmarkSchema = z
  .object({
    kind: z.enum(['peak', 'col', 'point']),
    index: z.number(),
    ele: z.number(),
    lat: z.number(),
    lon: z.number(),
    name: z.string().optional(),
  })
  .passthrough()

const bodySchema = z.object({
  landmarks: z.array(landmarkSchema).max(200),
})

/**
 * Names the unnamed summits and cols of a parsed GPX from OpenStreetMap.
 * Always answers: when Overpass is down the landmarks come back as they were,
 * flagged `unavailable`.
 */
export async function POST(request: Request) {
  const result = await parseAuthRequest(request, bodySchema)
  if (!result.ok) return result.response

  return NextResponse.json({
    data: await nameLandmarksFromOsm(result.data.landmarks),
  })
}
