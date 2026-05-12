import { getServerTranslation } from '@web/i18n/server'
import { getCategories } from '@web/lib/db/queries/categories'

import { CategoriesPageView } from './components/CategoriesPageView'

export default async function AdminCategoriesPage() {
  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const categories = await getCategories()
  return (
    <CategoriesPageView categories={categories} title={t('categories.title')} />
  )
}
