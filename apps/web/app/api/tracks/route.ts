import { NextResponse } from 'next/server'
import { z } from 'zod'

import { isValidTrackName } from '@sdlgr/gpx-tools'

import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import {
  MissingGithubTokenError,
  TrackExistsError,
  listTrackFiles,
  writeTrackFile,
} from '@web/lib/github/tracks'
import { logger } from '@web/lib/logger'

// Keeps the JSON body under Vercel's 4.5 MB request limit.
const MAX_CONTENT_LENGTH = 4_000_000

const createSchema = z.object({
  name: z.string().refine(isValidTrackName, 'Invalid track name'),
  content: z
    .string()
    .max(MAX_CONTENT_LENGTH)
    .refine((c) => c.includes('<gpx'), 'Content is not a GPX file'),
})

export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  try {
    return NextResponse.json(await listTrackFiles())
  } catch (err) {
    logger.error(err, 'Failed to list GPX tracks')
    return NextResponse.json(
      { error: 'Failed to list tracks' },
      { status: 502 },
    )
  }
}

export async function POST(request: Request) {
  const result = await parseAuthRequest(request, createSchema)
  if (!result.ok) return result.response

  const { name, content } = result.data
  const path = `${name}.gpx`
  try {
    const saved = await writeTrackFile(
      path,
      content,
      `Add ${path} from the blog track editor`,
      { createOnly: true },
    )
    logger.info({ path }, 'POST /api/tracks: uploaded')
    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    if (err instanceof TrackExistsError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    if (err instanceof MissingGithubTokenError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    logger.error(err, 'Failed to upload GPX track')
    return NextResponse.json(
      { error: 'Failed to upload track' },
      { status: 502 },
    )
  }
}
