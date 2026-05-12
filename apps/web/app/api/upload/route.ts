import { NextResponse } from 'next/server'

import { auth } from '@web/lib/auth/config'
import { uploadImage } from '@web/lib/cloudinary/upload'

const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported media type' },
      { status: 415 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  const altText = (formData.get('altText') as string | null) ?? ''
  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await uploadImage(buffer, file.type, altText)
  return NextResponse.json(result, { status: 201 })
}
