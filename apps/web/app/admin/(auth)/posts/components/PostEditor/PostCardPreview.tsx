'use client'

import { PostCard } from '@sdlgr/post-card'

import { useClientTranslation } from '@web/i18n/client'
import { computeReadingTime } from '@web/utils/computeReadingTime'

interface PostCardPreviewProps {
  title: string
  slug: string
  excerpt: string
  content: string
  categoryName: string
  tags: string[]
  coverImage: string
  author: string
  lng: string
}

export function PostCardPreview({
  title,
  slug,
  excerpt,
  content,
  categoryName,
  tags,
  coverImage,
  author,
  lng,
}: PostCardPreviewProps) {
  const { t } = useClientTranslation('admin')
  const readingTime = computeReadingTime(content)
  const publishedAt = new Date().toLocaleDateString()

  return (
    <div
      style={{
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(251,251,251,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
      data-testid="post-card-preview"
    >
      <span
        style={{
          fontSize: '0.55rem',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          opacity: 0.3,
        }}
      >
        {t('postEditor.cardPreview')}
      </span>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <PostCard
            id="preview"
            slug={slug}
            title={title}
            excerpt={excerpt}
            author={author}
            publishedAt={publishedAt}
            readingTime={readingTime}
            category={categoryName}
            tags={tags}
            coverImagePublicId={coverImage || null}
            lng={lng}
            readMoreLabel="Read more"
          />
        </div>
      </div>
    </div>
  )
}
