import { notFound } from 'next/navigation'

import { getServerTranslation } from '@web/i18n/server'
import { requireAdminRoleSession } from '@web/lib/auth/requireAdminRoleSession'
import { getUserById } from '@web/lib/db/queries/users'

import { UserForm } from '../components/UserForm'

export const dynamic = 'force-dynamic'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireAdminRoleSession()
  const { id } = await params
  const user = await getUserById(id)
  if (!user) return notFound()

  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })

  return (
    <UserForm
      mode="edit"
      title={t('users.form.editTitle')}
      backLabel={t('users.form.back')}
      initialValues={{
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }}
    />
  )
}
