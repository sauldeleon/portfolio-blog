import { getCldImageUrl } from 'next-cloudinary'
import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'
import React from 'react'

import { OgImageTemplate } from './OgImageTemplate'

async function fetchCoverAsDataUri(publicId: string): Promise<string | null> {
  try {
    const url = getCldImageUrl({
      src: publicId,
      width: 1200,
      height: 630,
      crop: 'fill',
    })
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const contentType = res.headers.get('content-type') ?? 'image/jpeg'
    return `data:${contentType};base64,${base64}`
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Saúl de León'
  const coverPublicId = searchParams.get('cover')
  const category = searchParams.get('category')

  const cover = coverPublicId ? await fetchCoverAsDataUri(coverPublicId) : null

  return new ImageResponse(
    React.createElement(OgImageTemplate, { title, cover, category }),
    { width: 1200, height: 630 },
  )
}
