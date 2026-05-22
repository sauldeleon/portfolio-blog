import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { AdminNav } from '../components/AdminNav'
import { StyledAuthLayout, StyledMain } from './layout.styles'

export const dynamic = 'force-dynamic'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await requireAdminSession()

  return (
    <StyledAuthLayout data-testid="auth-layout">
      <AdminNav role={session.user.role} />
      <StyledMain>{children}</StyledMain>
    </StyledAuthLayout>
  )
}
