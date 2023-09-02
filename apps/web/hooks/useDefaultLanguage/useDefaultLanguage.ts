'use client'

import { useMemo } from 'react'

import { STORAGE_I18N_KEY } from '@sdlgr/i18n-client'
import { LocalStorage, MockStorage, useStorage } from '@sdlgr/storage'

import { fallbackLng, languages } from '@web/i18n/settings'

export function useDefaultLanguage() {
  const browserLanguage =
    typeof navigator !== 'undefined'
      ? navigator.language.split('-')[0]
      : fallbackLng
  const initialLanguage = languages.includes(browserLanguage)
    ? browserLanguage
    : fallbackLng

  const localStorage = useMemo(
    () =>
      typeof window !== 'undefined'
        ? new LocalStorage<string>()
        : new MockStorage<string>(),
    []
  )
  const [storedLang] = useStorage({
    storage: localStorage,
    key: STORAGE_I18N_KEY,
  })

  return storedLang ?? initialLanguage
}
