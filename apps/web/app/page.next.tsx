'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import styled from 'styled-components'

import { useDefaultLanguage } from '@sdlgr/i18n-client'

import StyledComponentsRegistry from '@web/components/StyledComponentsRegistry/StyledComponentsRegistry'
import { fallbackLng, languages } from '@web/i18n/settings'

const StyledBody = styled.body`
  background-color: ${({ theme }) => theme.colors.black};
  height: 100vh;
  width: 100%;
`

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
