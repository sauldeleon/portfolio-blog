'use client'

import Cookies from 'js-cookie'
import {
  Dispatch,
  SetStateAction,
  createContext,
  useMemo,
  useState,
} from 'react'

import { LANGUAGE_COOKIE } from './i18n-config'

export type LanguageContext = {
  language: string | undefined
  setLanguage?: Dispatch<SetStateAction<string | undefined>>
}

export const LanguageContext = createContext<LanguageContext>({
  language: undefined,
})

interface LanguageProviderProps {
  value?: LanguageContext
  children: React.ReactNode
}

export function LanguageContextProvider({
  value,
  children,
}: LanguageProviderProps) {
  const [language, setLanguage] = useState(value?.language)
  if (language) {
    Cookies.set(LANGUAGE_COOKIE, language)
  }

  const valueMemoized = useMemo(() => ({ language, setLanguage }), [language])

  return (
    <LanguageContext.Provider value={valueMemoized}>
      {children}
    </LanguageContext.Provider>
  )
}
