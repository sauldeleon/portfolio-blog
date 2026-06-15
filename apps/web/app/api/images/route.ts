import { type NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@web/lib/api/parseRequest'
import { listImages, renameImage } from '@web/lib/cloudinary/images'
import { logger } from '@web/lib/logger'

export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  try {
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined
    const search = request.nextUrl.searchParams.get('search') ?? undefined
    const { images, nextCursor } = await listImages(cursor, undefined, search)
    logger.debug({ count: images.length }, 'GET /api/images')
    return NextResponse.json(
      { images, ...(nextCursor ? { nextCursor } : {}) },
      { status: 200 },
    )
  } catch (err) {
    logger.error(err, 'Failed to list images')
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const body = (await request.json()) as { publicId?: string; newName?: string }
  const { publicId, newName } = body

  if (!publicId || !newName) {
    return NextResponse.json(
      { error: 'Missing publicId or newName' },
      { status: 400 },
    )
  }

  try {
    const image = await renameImage(publicId, newName)
    logger.info({ publicId, newName }, 'PATCH /api/images: renamed')
    return NextResponse.json(image, { status: 200 })
  } catch (err) {
    logger.error(err, 'Failed to rename image')
    return NextResponse.json(
      { error: 'Failed to rename image' },
      { status: 500 },
    )
  }
}
