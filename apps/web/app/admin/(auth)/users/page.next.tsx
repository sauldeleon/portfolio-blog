import { getServerTranslation } from '@web/i18n/server'
import { requireAdminRoleSession } from '@web/lib/auth/requireAdminRoleSession'
import { listUsers } from '@web/lib/db/queries/users'

import { UsersPageView } from './components/UsersPageView'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  await requireAdminRoleSession()
  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const users = await listUsers()
  return <UsersPageView users={users} title={t('users.title')} />
}
