import { InitOptions } from 'i18next'

import common from './locales/en/common.json'
import header from './locales/en/header.json'

export const LANGUAGE_COOKIE = 'i18nextLng'
export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es']
export const defaultNS = 'common'

export const resources = {
  en: {
    common,
    header,
  },
} as const

export function getOptions(
  lng = fallbackLng,
  ns: string | string[] = defaultNS
): InitOptions {
  return {
    // debug: true,
    supportedLngs: languages,
    preload: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    // backend: {
    //   projectId: '01b2e5e8-6243-47d1-b36f-963dbb8bcae3'
    // }
  }
}
