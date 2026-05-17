import { NextResponse } from 'next/server'

import { auth } from '@web/lib/auth/config'
import { destroyImage } from '@web/lib/cloudinary/images'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ publicId: string[] }> },
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { publicId: segments } = await params
  const publicId = segments.join('/')
  try {
    await destroyImage(publicId)
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    )
  }
  return new NextResponse(null, { status: 204 })
}
