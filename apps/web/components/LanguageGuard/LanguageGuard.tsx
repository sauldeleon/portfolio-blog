'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

import { useDefaultLanguage } from '@sdlgr/i18n-tools'

import { fallbackLng, languages } from '@web/i18n/settings'
import { removeFirstPart } from '@web/utils/url/removeFirstPart'

import { StyledGuardWrapper } from './LanguageGuard.styles'

interface LanguageGuardProps {
  children: React.ReactNode
}

export function LanguageGuard({ children }: LanguageGuardProps) {
  const pathname = usePathname()
  const params = useParams()
  const language = params.lng
  const router = useRouter()
  const defaultLanguage = useDefaultLanguage({ languages, fallbackLng })

  const isLanguagePathParam =
    typeof language === 'string' && language.length === 2
  const isAllowedLanguage = languages.some((loc) => language === loc)
  // Decided during render (server included) so prerendered pages ship their
  // content instead of an empty body waiting for a client effect.
  const isValidLanguage = isLanguagePathParam && isAllowedLanguage

  useEffect(() => {
    if (isValidLanguage) return
    if (!isLanguagePathParam) {
      router.push(`/${defaultLanguage}${pathname}`)
    } else {
      router.push(`/${defaultLanguage}${removeFirstPart(pathname)}`)
    }
  }, [defaultLanguage, isLanguagePathParam, isValidLanguage, pathname, router])

  return isValidLanguage ? (
    <StyledGuardWrapper>{children}</StyledGuardWrapper>
  ) : null
}
