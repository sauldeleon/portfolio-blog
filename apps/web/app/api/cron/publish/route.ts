import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import {
  getScheduledPostsToPublish,
  updatePost,
} from '@web/lib/db/queries/posts'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const scheduled = await getScheduledPostsToPublish()

  await Promise.all(
    scheduled.map((post) =>
      updatePost(post.id, {
        status: 'published',
        publishedAt: post.scheduledAt,
      }),
    ),
  )

  if (scheduled.length > 0) {
    revalidateTag('posts', 'default')
  }

  return NextResponse.json({ published: scheduled.length })
}
