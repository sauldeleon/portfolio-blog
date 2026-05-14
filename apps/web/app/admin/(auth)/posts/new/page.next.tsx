import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getCategoriesForAdmin } from '@web/lib/db/queries/categories'

import { PostEditor } from '../components/PostEditor'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const session = await requireAdminSession()
  const categoriesForAdmin = await getCategoriesForAdmin()

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

  return <PostEditor categories={categories} author={author} />
}
