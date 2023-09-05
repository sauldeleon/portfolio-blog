'use client'

import { StyledContent, StyledPage } from './MainLayout.styles'
import { CookieBanner } from './components/CookieBanner/CookieBanner'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { ProgressBar } from './components/ProgressBar/ProgressBar'

interface LayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <StyledPage>
      <ProgressBar />
      <Header />
      <StyledContent>{children}</StyledContent>
      <CookieBanner />
      <Footer />
    </StyledPage>
  )
}
