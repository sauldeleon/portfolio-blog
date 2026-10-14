import { NextResponse } from 'next/server'
import { z } from 'zod'

import { cleanPathFor } from '@sdlgr/gpx-tools'

import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import {
  MissingGithubTokenError,
  isValidTrackPath,
  rawUrlFor,
  readTrackFile,
  writeTrackFile,
} from '@web/lib/github/tracks'
import { logger } from '@web/lib/logger'

// Keeps the JSON body under Vercel's 4.5 MB request limit.
const MAX_CONTENT_LENGTH = 4_000_000

const pathSchema = z.string().refine(isValidTrackPath, 'Invalid track path')

const saveSchema = z.object({
  sourcePath: pathSchema,
  content: z
    .string()
    .max(MAX_CONTENT_LENGTH)
    .refine((c) => c.includes('<gpx'), 'Content is not a GPX file'),
})

export async function GET(request: Request) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { searchParams } = new URL(request.url)
  const parsed = pathSchema.safeParse(searchParams.get('path'))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid track path' }, { status: 400 })
  }

  try {
    const content = await readTrackFile(parsed.data)
    return NextResponse.json({
      path: parsed.data,
      rawUrl: rawUrlFor(parsed.data),
      content,
    })
  } catch (err) {
    logger.error(err, 'Failed to read GPX track')
    return NextResponse.json({ error: 'Failed to read track' }, { status: 502 })
  }
}

export async function PUT(request: Request) {
  const result = await parseAuthRequest(request, saveSchema)
  if (!result.ok) return result.response

  const { sourcePath, content } = result.data
  const targetPath = cleanPathFor(sourcePath)
  try {
    const saved = await writeTrackFile(
      targetPath,
      content,
      `Update ${targetPath} from the blog track editor`,
    )
    logger.info({ path: targetPath }, 'PUT /api/tracks/file: saved')
    return NextResponse.json(saved)
  } catch (err) {
    if (err instanceof MissingGithubTokenError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    logger.error(err, 'Failed to save GPX track')
    return NextResponse.json({ error: 'Failed to save track' }, { status: 502 })
  }
}
