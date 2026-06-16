import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { PostHero } from '@sdlgr/post-hero'

import { PostComments } from '@web/components/PostComments'
import { PostContent } from '@web/components/PostContent/PostContent'
import { PreviewBanner } from '@web/components/PreviewBanner'
import { auth } from '@web/lib/auth/config'
import { getPostByPreviewToken } from '@web/lib/db/queries/posts'
import { renderMDX } from '@web/lib/mdx/renderMDX'
import { computeReadingTime } from '@web/utils/computeReadingTime'

import { StyledPage } from './page.next.styles'

interface RouteProps {
  params: Promise<{ token: string }>
}

export default async function PreviewPage({ params }: RouteProps) {
  const session = await auth()
  if (!session) return notFound()

  const { token } = await params
  const result = await getPostByPreviewToken(token)
  if (!result) return notFound()

  const { post, translations, authorName } = result

  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') ?? ''
  const lng = acceptLang.toLowerCase().startsWith('es') ? 'es' : 'en'

  const translation =
    translations.find((t) => t.locale === lng) ??
    translations.find((t) => t.locale === 'en') ??
    translations[0]

  if (!translation) return notFound()

  return (
    <StyledPage>
      <PreviewBanner label="Admin preview — this post is not publicly visible" />
      <PostHero
        title={translation.title}
        coverImagePublicId={post.coverImage}
        category={post.category}
        author={authorName}
        publishedAt={null}
        readingTime={computeReadingTime(translation.content)}
        lng={lng}
      />
      <PostContent>{renderMDX(translation.content)}</PostContent>
      <PostComments
        postId={post.id}
        postTitle={translation.title}
        postNumber={post.postNumber ?? 0}
        postSlug={translation.slug}
        lng={lng}
        commentsEnabled={post.commentsEnabled}
      />
    </StyledPage>
  )
}
