import { getServerTranslation } from '@web/i18n/server'
import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { SeriesForm } from '../components/SeriesForm'

export const dynamic = 'force-dynamic'

export default async function NewSeriesPage() {
  await requireAdminSession()
  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })

  return (
    <SeriesForm
      title={t('series.form.createTitle')}
      backLabel={t('series.form.back')}
    />
  )
}
