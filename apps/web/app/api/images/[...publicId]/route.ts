import { NextResponse } from 'next/server'

import { requireAuth } from '@web/lib/api/parseRequest'
import { destroyImage } from '@web/lib/cloudinary/images'
import { logger } from '@web/lib/logger'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ publicId: string[] }> },
) {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const { publicId: segments } = await params
  const publicId = segments.join('/')
  logger.debug({ publicId }, 'DELETE /api/images/[publicId]')
  try {
    await destroyImage(publicId)
  } catch (err) {
    logger.error(err, 'Failed to delete image')
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    )
  }
  logger.info({ publicId }, 'DELETE /api/images/[publicId]: deleted')
  return new NextResponse(null, { status: 204 })
}
