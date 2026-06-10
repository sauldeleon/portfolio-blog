import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

import {
  getScheduledPostsToPublish,
  updatePost,
} from '@web/lib/db/queries/posts'
import { notifyPostPublished } from '@web/lib/email/notifyPostPublished'
import { logger } from '@web/lib/logger'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const scheduled = await getScheduledPostsToPublish()

    const publishedPosts = await Promise.all(
      scheduled.map((post) =>
        updatePost(post.id, {
          status: 'published',
          publishedAt: post.scheduledAt,
        }),
      ),
    )

    if (scheduled.length > 0) {
      revalidateTag('posts', 'default')
      for (const post of scheduled) {
        revalidateTag(`post-${post.id}`, 'default')
      }
    }

    for (const post of publishedPosts) {
      if (!post) continue
      await notifyPostPublished(
        post,
        'cron/publish: failed to send notifications',
      )
    }

    return NextResponse.json({ published: scheduled.length })
  } catch (err) {
    logger.error(err, 'Failed to publish scheduled posts')
    return NextResponse.json(
      { error: 'Failed to publish scheduled posts' },
      { status: 500 },
    )
  }
}
