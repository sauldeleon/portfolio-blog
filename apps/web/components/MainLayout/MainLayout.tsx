'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useContext, useEffect } from 'react'

import { LanguageContext, useDefaultLanguage } from '@sdlgr/i18n-tools'

import { fallbackLng, languages } from '@web/i18n/settings'

import { StyledContent, StyledPage } from './MainLayout.styles'
import { CookieBanner } from './components/CookieBanner/CookieBanner'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'
import { ProgressBar } from './components/ProgressBar/ProgressBar'

interface LayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: LayoutProps) {
  const { language } = useContext(LanguageContext)
  const pathname = usePathname()
  const router = useRouter()
  const defaultLanguage = useDefaultLanguage({ languages, fallbackLng })

  useEffect(() => {
    if (!languages.some((loc) => language === loc)) {
      const urlParts = pathname.split('/').filter(Boolean)
      const differencePath = urlParts.slice(1, urlParts.length).join('/')
      router.push(`/${defaultLanguage}/${differencePath}`)
    }
  }, [defaultLanguage, language, pathname, router])

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
