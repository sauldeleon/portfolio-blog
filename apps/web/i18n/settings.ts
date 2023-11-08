import common from './locales/en/common.json'
import contactPage from './locales/en/contactPage.json'
import experiencePage from './locales/en/experiencePage.json'
import footer from './locales/en/footer.json'
import header from './locales/en/header.json'
import homepage from './locales/en/homepage.json'
import notFound from './locales/en/notFound.json'
import portfolioPage from './locales/en/portfolioPage.json'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es']
export const defaultNS = 'common'

export const resources = {
  en: {
    common,
    header,
    footer,
    homepage,
    contactPage,
    experiencePage,
    portfolioPage,
    notFound,
  },
} as const
