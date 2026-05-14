'use server'

import { redirect } from 'next/navigation'

import { signOut } from '@web/lib/auth/config'

export async function logoutAction() {
  await signOut({ redirect: false })
  redirect('/admin/login')
}
