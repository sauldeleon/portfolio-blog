import { redirect } from 'next/navigation'

import { auth } from './config'

export async function requireAdminSession() {
  const session = await auth()

  if (!session) {
    redirect('/admin/login')
  }

  return session
}
