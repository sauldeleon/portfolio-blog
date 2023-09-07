'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import { useDefaultLanguage } from '@sdlgr/i18n-tools'

import { fallbackLng, languages } from '@web/i18n/settings'
import { removeFirstPart } from '@web/utils/url/removeFirstPart'

import { StyledGuardWrapper } from './LanguageGuard.styles'

interface LanguageGuardProps {
  children: React.ReactNode
}

export function LanguageGuard({ children }: LanguageGuardProps) {
  const [isReady, setIsReady] = useState(false)
  const pathname = usePathname()
  const params = useParams()
  const language = params.lng
  const router = useRouter()
  const defaultLanguage = useDefaultLanguage({ languages, fallbackLng })

  useEffect(() => {
    const isAllowedLanguage = languages.some((loc) => language === loc)
    const isLanguagePathParam = language && language?.length === 2

    if (!isLanguagePathParam) {
      router.push(`/${defaultLanguage}${pathname}`)
    } else if (isLanguagePathParam && !isAllowedLanguage) {
      const differencePath = removeFirstPart(pathname)
      router.push(`/${defaultLanguage}${differencePath}`)
    } else {
      setIsReady(true)
    }
  }, [defaultLanguage, language, pathname, router])

  return isReady ? <StyledGuardWrapper>{children}</StyledGuardWrapper> : null
}
