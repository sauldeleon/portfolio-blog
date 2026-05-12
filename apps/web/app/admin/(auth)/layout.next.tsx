import { AdminNav } from '../components/AdminNav'
import { StyledAuthLayout, StyledMain } from './layout.styles'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <StyledAuthLayout data-testid="auth-layout">
      <AdminNav />
      <StyledMain>{children}</StyledMain>
    </StyledAuthLayout>
  )
}
