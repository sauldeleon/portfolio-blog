import { getOptions } from './i18n-config'

describe('i18n-config getOptions', () => {
  it('should return the desired object', () => {
    expect(
      getOptions({
        lng: 'en',
        ns: 'common',
        languages: ['en', 'es'],
        fallbackLng: 'en',
        defaultNS: 'common',
      })
    ).toEqual({
      defaultNS: 'common',
      fallbackLng: 'en',
      fallbackNS: 'common',
      lng: 'en',
      ns: 'common',
      preload: ['en', 'es'],
      supportedLngs: ['en', 'es'],
    })
  })

  it('should return the fallback options', () => {
    expect(
      getOptions({
        languages: ['en', 'es'],
        fallbackLng: 'en',
        defaultNS: 'common',
      })
    ).toEqual({
      defaultNS: 'common',
      fallbackLng: 'en',
      fallbackNS: 'common',
      lng: 'en',
      ns: 'common',
      preload: ['en', 'es'],
      supportedLngs: ['en', 'es'],
    })
  })
})
