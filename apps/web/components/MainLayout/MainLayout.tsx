'use client'

import { StyledContent, StyledPage } from './MainLayout.styles'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'

interface LayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <StyledPage>
      <Header />
      <StyledContent>{children}</StyledContent>
      <Footer />
    </StyledPage>
  )
}
