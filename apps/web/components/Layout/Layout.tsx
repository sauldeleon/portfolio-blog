import { Header } from '@web/components/Header/Header'

import { StyledContent, StyledPage } from './Layout.styles'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <StyledPage>
      <Header />
      <StyledContent>{children}</StyledContent>
    </StyledPage>
  )
}
