import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { PostHero } from '@sdlgr/post-hero'

import { getPostByPreviewToken } from '@web/lib/db/queries/posts'
import { renderMDX } from '@web/lib/mdx/renderMDX'
import { computeReadingTime } from '@web/utils/computeReadingTime'

interface RouteProps {
  params: Promise<{ token: string }>
}

export default async function PreviewPage({ params }: RouteProps) {
  const { token } = await params
  const result = await getPostByPreviewToken(token)
  if (!result) return notFound()

  const { post, translations } = result

  const headersList = await headers()
  const acceptLang = headersList.get('accept-language') ?? ''
  const lng = acceptLang.toLowerCase().startsWith('es') ? 'es' : 'en'

  const translation =
    translations.find((t) => t.locale === lng) ??
    translations.find((t) => t.locale === 'en') ??
    translations[0]

  if (!translation) return notFound()

  return (
    <main>
      <div data-testid="preview-banner">PREVIEW MODE</div>
      <PostHero
        title={translation.title}
        coverImagePublicId={post.coverImage}
        category={post.category}
        author={post.author}
        publishedAt={null}
        readingTime={computeReadingTime(translation.content)}
        lng={lng}
      />
      <article>{renderMDX(translation.content)}</article>
    </main>
  )
}
