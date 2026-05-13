import { getServerTranslation } from '@web/i18n/server'
import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getCategories } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './components/CategoriesPageView'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  await requireAdminSession()

  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const categories = await getCategories()
  return (
    <CategoriesPageView categories={categories} title={t('categories.title')} />
  )
}
