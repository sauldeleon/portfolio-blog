import { getServerTranslation } from '@web/i18n/server'
import { requireAdminSession } from '@web/lib/auth/requireAdminSession'
import { getCommentsAdmin } from '@web/lib/db/queries/comments'

import { CommentsPageView } from './components/CommentsPageView'

export const dynamic = 'force-dynamic'

export default async function AdminCommentsPage() {
  await requireAdminSession()

  const { t } = await getServerTranslation({ language: 'en', ns: 'admin' })
  const initialComments = await getCommentsAdmin({ status: 'pending' })

  return (
    <CommentsPageView
      initialComments={initialComments}
      title={t('comments.title')}
    />
  )
}
