import { redirect } from 'next/navigation'

import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  await requireAdminSession()

  redirect('/admin/posts')
}
