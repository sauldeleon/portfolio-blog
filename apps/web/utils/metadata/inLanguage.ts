const BASE_URL = 'https://www.sawl.dev'

export const inLanguage = (lng: string): string =>
  lng === 'es' ? 'es-ES' : 'en-US'

export const ogLocale = (lng: string): string =>
  lng === 'es' ? 'es_ES' : 'en_US'

export const ogLocaleAlternate = (lng: string): string[] =>
  lng === 'es' ? ['en_US'] : ['es_ES']

export const buildAlternates = (lng: string, slug: string) => ({
  canonical: `${BASE_URL}/${lng}/${slug}`,
  languages: {
    'en-US': `${BASE_URL}/en/${slug}`,
    'en-GB': `${BASE_URL}/en/${slug}`,
    'es-ES': `${BASE_URL}/es/${slug}`,
    'x-default': `${BASE_URL}/en/${slug}`,
  },
})
