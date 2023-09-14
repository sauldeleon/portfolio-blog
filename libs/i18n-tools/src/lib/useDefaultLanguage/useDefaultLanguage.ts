'use client'

import { useMemo } from 'react'

import { STORAGE_I18N_KEY } from '@sdlgr/i18n-config'
import { LocalStorage, MockStorage, useStorage } from '@sdlgr/storage'

interface UseDefaultLanguageProps {
  languages: string[]
  fallbackLng: string
}
export function useDefaultLanguage({
  languages,
  fallbackLng,
}: UseDefaultLanguageProps) {
  const browserLanguage =
    typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : ''
  const storage = useMemo(
    () =>
      typeof window !== 'undefined' ? new LocalStorage() : new MockStorage(),
    [],
  )
  const [getItem] = useStorage(storage)
  const storedLang = getItem(STORAGE_I18N_KEY)
  if (storedLang) {
    return storedLang
  }

  return languages.includes(browserLanguage) ? browserLanguage : fallbackLng
}
