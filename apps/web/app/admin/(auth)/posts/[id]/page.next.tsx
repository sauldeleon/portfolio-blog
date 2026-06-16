import { notFound } from 'next/navigation'

import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getCategoriesForAdmin } from '@web/lib/db/queries/categories'
import { getPostForEdit } from '@web/lib/db/queries/posts'
import { getAllSeriesWithTranslations } from '@web/lib/db/queries/series'
import { getAllTagsAdmin } from '@web/lib/db/queries/tags'
import { listUsers } from '@web/lib/db/queries/users'

import { PostEditor } from '../components/PostEditor'

export const dynamic = 'force-dynamic'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [session, postData, categoriesForAdmin, allTags, series, users] =
    await Promise.all([
      requireAdminSession(),
      getPostForEdit(id),
      getCategoriesForAdmin(),
      getAllTagsAdmin(),
      getAllSeriesWithTranslations(),
      listUsers(),
    ])

  if (!postData) return notFound()

  const categories = categoriesForAdmin.map((cat) => ({
    slug: cat.slug,
    name:
      cat.translations.find((t) => t.locale === 'en')?.name ??
      cat.translations[0]?.name ??
      cat.slug,
  }))

  const editorPost = {
    post: {
      id: postData.post.id,
      postNumber: postData.post.postNumber,
      category: postData.post.category,
      tags: postData.post.tags,
      status: postData.post.status,
      coverImage: postData.post.coverImage,
      coverImageFit: postData.post.coverImageFit,
      seriesId: postData.post.seriesId,
      seriesOrder: postData.post.seriesOrder,
      scheduledAt: postData.post.scheduledAt,
      authorId: postData.post.authorId,
      commentsEnabled: postData.post.commentsEnabled,
      previewToken: postData.post.previewToken,
    },
    translations: postData.translations.map((t) => ({
      locale: t.locale,
      title: t.title,
      slug: t.slug,
      excerpt: t.excerpt,
      content: t.content,
    })),
  }

  return (
    <PostEditor
      post={editorPost}
      categories={categories}
      users={users}
      allTags={allTags}
      series={series}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
    />
  )
}
