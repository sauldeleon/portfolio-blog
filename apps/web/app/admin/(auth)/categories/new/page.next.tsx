import { getServerTranslation } from '@web/i18n/server'
import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { CategoryForm } from '../components/CategoryForm'

export const dynamic = 'force-dynamic'

export default async function NewCategoryPage() {
  await requireAdminSession()
  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })

  return (
    <CategoryForm
      title={t('categories.new.title')}
      backLabel={t('categories.form.back')}
    />
  )
}
