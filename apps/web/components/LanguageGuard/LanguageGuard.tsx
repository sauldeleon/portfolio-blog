'use client'

import { usePathname, useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'

import { LanguageContext, useDefaultLanguage } from '@sdlgr/i18n-tools'

import { fallbackLng, languages } from '@web/i18n/settings'

import { StyledGuardWrapper } from './LanguageGuard.styles'

interface LanguageGuardProps {
  children: React.ReactNode
}

export function LanguageGuard({ children }: LanguageGuardProps) {
  const [isReady, setIsReady] = useState(false)
  const { language } = useContext(LanguageContext)
  const pathname = usePathname()
  const router = useRouter()
  const defaultLanguage = useDefaultLanguage({ languages, fallbackLng })

  useEffect(() => {
    if (!languages.some((loc) => language === loc)) {
      const urlParts = pathname.split('/').filter(Boolean)
      const differencePath = urlParts.slice(1, urlParts.length).join('/')
      router.push(`/${defaultLanguage}/${differencePath}`)
    } else {
      setIsReady(true)
    }
  }, [defaultLanguage, language, pathname, router])

  return isReady ? <StyledGuardWrapper>{children}</StyledGuardWrapper> : null
}
