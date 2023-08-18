import common from './locales/en/common.json'
import footer from './locales/en/footer.json'
import header from './locales/en/header.json'
import homepage from './locales/en/homepage.json'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es']
export const defaultNS = 'common'

export const resources = {
  en: {
    common,
    header,
    footer,
    homepage,
  },
} as const
