import { NextResponse } from 'next/server'

import { auth } from '@web/lib/auth/config'
import { getPostsForSeries } from '@web/lib/db/queries/series'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const posts = await getPostsForSeries(id)
  return NextResponse.json({ data: posts })
}
