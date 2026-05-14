import { notFound } from 'next/navigation'

import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getCategoriesForAdmin } from '@web/lib/db/queries/categories'
import { getPostForEdit } from '@web/lib/db/queries/posts'

import { PostEditor } from '../components/PostEditor'

export const dynamic = 'force-dynamic'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [session, postData, categoriesForAdmin] = await Promise.all([
    requireAdminSession(),
    getPostForEdit(id),
    getCategoriesForAdmin(),
  ])

  if (!postData) return notFound()

  const categories = categoriesForAdmin.map((cat) => ({
    slug: cat.slug,
    name:
      cat.translations.find((t) => t.locale === 'en')?.name ??
      cat.translations[0]?.name ??
      cat.slug,
  }))

  const author =
    (session as { user?: { name?: string | null } } | null)?.user?.name ??
    'Admin'

  const editorPost = {
    post: {
      id: postData.post.id,
      category: postData.post.category,
      tags: postData.post.tags,
      status: postData.post.status,
      coverImage: postData.post.coverImage,
      seriesId: postData.post.seriesId,
      seriesOrder: postData.post.seriesOrder,
      author: postData.post.author,
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
    <PostEditor post={editorPost} categories={categories} author={author} />
  )
}
