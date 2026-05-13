import { redirect } from 'next/navigation'

import { auth } from '@web/lib/auth/config'

import { AdminNav } from '../components/AdminNav'
import { StyledAuthLayout, StyledMain } from './layout.styles'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <StyledAuthLayout data-testid="auth-layout">
      <AdminNav />
      <StyledMain>{children}</StyledMain>
    </StyledAuthLayout>
  )
}
