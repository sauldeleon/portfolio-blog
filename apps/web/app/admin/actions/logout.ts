'use server'

import { signOut } from '@web/lib/auth/config'

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
