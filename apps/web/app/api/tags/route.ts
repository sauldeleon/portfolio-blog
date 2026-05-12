import { NextResponse } from 'next/server'

import { getPostCountPerTag } from '@web/lib/db/queries/tags'

const CACHE_HEADERS = {
  'Cache-Control': 's-maxage=60, stale-while-revalidate=3600',
}

export async function GET() {
  const tags = await getPostCountPerTag()
  return NextResponse.json({ data: tags }, { headers: CACHE_HEADERS })
}
