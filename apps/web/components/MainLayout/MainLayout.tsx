'use client'

import { useEffect } from 'react'

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

  // Pages are server-rendered, so their markup is visible before React
  // attaches event handlers. Flag the moment hydration is done (this effect
  // runs after every child's) so e2e tests can wait for it before clicking.
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true'
  }, [])

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
