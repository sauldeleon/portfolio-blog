import {
  BackendModule,
  FlatNamespace,
  KeyPrefix,
  createInstance,
} from 'i18next'
import { FallbackNs } from 'react-i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { getOptions } from '@sdlgr/i18n-config'

type TranslationPreferences = {
  language?: string
  fallbackLng: string
  defaultNS: string | string[]
  languages: string[]
  resourcesToBackend: BackendModule<object>
}

/**
 * One instance per language and namespace set, shared by every server render.
 * Each instance is created with its language fixed and only read through
 * getFixedT, so renders running in parallel cannot leak languages into each
 * other; reusing them avoids re-initialising i18next on every call (a post
 * page asks for translations several times per render).
 */
const instances = new Map<string, ReturnType<typeof createI18nInstance>>()

async function createI18nInstance(
  preferences: TranslationPreferences,
  lng: string,
  ns: string | string[],
) {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(preferences.resourcesToBackend)
    .init(getOptions({ lng, ns, ...preferences }))
  return i18nInstance
}

function initI18next(
  preferences: TranslationPreferences,
  lng: string,
  ns: string | string[],
) {
  const key = `${lng}|${([] as string[]).concat(ns ?? []).join(',')}`
  let instance = instances.get(key)
  if (!instance) {
    instance = createI18nInstance(preferences, lng, ns)
    // Do not keep a failed initialisation around.
    instance.catch(() => instances.delete(key))
    instances.set(key, instance)
  }
  return instance
}

export async function useServerTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  preferences: TranslationPreferences,
  ns?: Ns,
  options: { keyPrefix?: KPrefix } = {},
) {
  const finalLanguage = preferences.language ?? preferences.fallbackLng
  const i18nextInstance = await initI18next(
    preferences,
    finalLanguage,
    Array.isArray(ns) ? (ns as string[]) : (ns as string),
  )
  return {
    t: i18nextInstance.getFixedT(finalLanguage, ns, options.keyPrefix),
    i18n: i18nextInstance,
  }
}
