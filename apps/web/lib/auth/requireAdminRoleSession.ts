import { redirect } from 'next/navigation'

import { requireAdminSession } from './requireAdminSession'

export async function requireAdminRoleSession() {
  const session = await requireAdminSession()

  if (session.user.role !== 'admin') {
    redirect('/admin/posts')
  }

  return session
}
