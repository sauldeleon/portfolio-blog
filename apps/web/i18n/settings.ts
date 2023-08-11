import common from './locales/en/common.json'
import header from './locales/en/header.json'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es']
export const defaultNS = 'common'

export const resources = {
  en: {
    common,
    header,
  },
} as const
