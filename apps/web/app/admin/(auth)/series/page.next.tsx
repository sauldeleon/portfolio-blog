import { getServerTranslation } from '@web/i18n/server'
import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getSeriesForAdmin } from '@web/lib/db/queries/series'

import { SeriesPageView } from './components/SeriesPageView'

export const dynamic = 'force-dynamic'

export default async function AdminSeriesPage() {
  await requireAdminSession()

  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const seriesList = await getSeriesForAdmin()
  return <SeriesPageView series={seriesList} title={t('series.title')} />
}
