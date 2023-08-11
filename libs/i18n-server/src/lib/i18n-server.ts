import {
  BackendModule,
  FlatNamespace,
  KeyPrefix,
  createInstance,
} from 'i18next'
import { cookies } from 'next/headers'
import { FallbackNs } from 'react-i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { LANGUAGE_COOKIE, getOptions } from '@sdlgr/i18n-config'

type TranslationPreferences = {
  fallbackLng: string
  defaultNS: string | string[]
  languages: string[]
  resourcesToBackend: BackendModule<object>
}

const initI18next = async (
  preferences: TranslationPreferences,
  lng: string,
  ns: string | string[]
) => {
  // on server side we create a new instance for each render, because during compilation everything seems to be executed in parallel
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(preferences.resourcesToBackend)
    .init(getOptions({ lng, ns, ...preferences }))
  return i18nInstance
}

export async function useServerTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(
  preferences: TranslationPreferences,
  ns?: Ns,
  options: { keyPrefix?: KPrefix } = {}
) {
  const language =
    cookies().get(LANGUAGE_COOKIE)?.value || preferences.fallbackLng
  const i18nextInstance = await initI18next(
    preferences,
    language,
    Array.isArray(ns) ? (ns as string[]) : (ns as string)
  )
  return {
    t: i18nextInstance.getFixedT(language, ns, options.keyPrefix),
    i18n: i18nextInstance,
  }
}
