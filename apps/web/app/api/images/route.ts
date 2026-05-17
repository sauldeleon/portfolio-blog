import { type NextRequest, NextResponse } from 'next/server'

import { auth } from '@web/lib/auth/config'
import { listImages, renameImage } from '@web/lib/cloudinary/images'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cursor = request.nextUrl.searchParams.get('cursor') ?? undefined
    const { images, nextCursor } = await listImages(cursor)
    return NextResponse.json(
      { images, ...(nextCursor ? { nextCursor } : {}) },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    return NextResponse.json(image, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to rename image' },
      { status: 500 },
    )
  }
}
