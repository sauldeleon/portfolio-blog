import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

import { OgImageTemplate } from './OgImageTemplate'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Saúl de León'
  const cover = searchParams.get('cover')
  const category = searchParams.get('category')

  return new ImageResponse(
    <OgImageTemplate title={title} cover={cover} category={category} />,
    { width: 1200, height: 630 },
  )
}
