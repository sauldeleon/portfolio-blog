import React from 'react'

import { requireAdminRoleSession } from '@web/lib/auth/requireAdminRoleSession'

export const dynamic = 'force-dynamic'

interface UsersLayoutProps {
  children: React.ReactNode
}

export default async function UsersLayout({
  children,
}: UsersLayoutProps): Promise<React.ReactNode> {
  await requireAdminRoleSession()
  return children
}
