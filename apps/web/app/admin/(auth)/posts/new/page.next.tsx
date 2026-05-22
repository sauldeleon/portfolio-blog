import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getCategoriesForAdmin } from '@web/lib/db/queries/categories'
import { getAllSeriesWithTranslations } from '@web/lib/db/queries/series'
import { getAllTagsAdmin } from '@web/lib/db/queries/tags'
import { listUsers } from '@web/lib/db/queries/users'

import { PostEditor } from '../components/PostEditor'

export const dynamic = 'force-dynamic'

export default async function NewPostPage() {
  const session = await requireAdminSession()
  const [categoriesForAdmin, allTags, series, users] = await Promise.all([
    getCategoriesForAdmin(),
    getAllTagsAdmin(),
    getAllSeriesWithTranslations(),
    listUsers(),
  ])

  const categories = categoriesForAdmin.map((cat) => ({
    slug: cat.slug,
    name:
      cat.translations.find((t) => t.locale === 'en')?.name ??
      cat.translations[0]?.name ??
      cat.slug,
  }))

  return (
    <PostEditor
      categories={categories}
      users={users}
      allTags={allTags}
      series={series}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
    />
  )
}
