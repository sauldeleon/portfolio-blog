import { getServerTranslation } from '@web/i18n/server'
import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getSubscriptionsAdmin } from '@web/lib/db/queries/subscriptions'

import { SubscribersPageView } from './components/SubscribersPageView'

export const dynamic = 'force-dynamic'

export default async function AdminSubscribersPage() {
  await requireAdminSession()

  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const initialSubscriptions = await getSubscriptionsAdmin()

  return (
    <SubscribersPageView
      initialSubscriptions={initialSubscriptions}
      title={t('subscribers.title')}
    />
  )
}
