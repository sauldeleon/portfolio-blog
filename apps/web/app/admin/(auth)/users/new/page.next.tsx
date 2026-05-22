import { getServerTranslation } from '@web/i18n/server'
import { requireAdminRoleSession } from '@web/lib/auth/requireAdminRoleSession'

import { UserForm } from '../components/UserForm'

export const dynamic = 'force-dynamic'

export default async function NewUserPage() {
  await requireAdminRoleSession()
  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })

  return (
    <UserForm
      title={t('users.form.createTitle')}
      backLabel={t('users.form.back')}
    />
  )
}
