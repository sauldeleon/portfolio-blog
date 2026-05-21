'use client'

import { useClientTranslation } from '@web/i18n/client'

import { StyledContent, StyledPage, StyledSkipLink } from './MainLayout.styles'
import { CookieBanner } from './components/CookieBanner/CookieBanner'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { ProgressBar } from './components/ProgressBar/ProgressBar'

interface LayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: LayoutProps) {
  const { t } = useClientTranslation('common')

  return (
    <StyledPage>
      <StyledSkipLink href="#main-content">{t('skipToContent')}</StyledSkipLink>
      <ProgressBar />
      <Header />
      <StyledContent id="main-content">{children}</StyledContent>
      <CookieBanner />
      <Footer />
    </StyledPage>
  )
}
