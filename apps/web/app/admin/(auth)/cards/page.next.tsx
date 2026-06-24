import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { CardGenerator } from './components/CardGenerator'

export const dynamic = 'force-dynamic'

export default async function AdminCardsPage() {
  await requireAdminSession()
  return <CardGenerator />
}
