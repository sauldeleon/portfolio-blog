'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useDefaultLanguage } from '@sdlgr/i18n-tools'

import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'
import { fallbackLng, languages } from '@web/i18n/settings'

import { StyledBody } from './page.styles'

export default function RootPage() {
  const lang = useDefaultLanguage({ languages, fallbackLng })
  const router = useRouter()
  useEffect(() => {
    router.push(`/${lang}`)
  }, [router, lang])

  return (
    <html>
      <StyledComponentsRegistry>
        <StyledBody />
      </StyledComponentsRegistry>
    </html>
  )
}
