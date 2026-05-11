import { buildAlternates, inLanguage, ogLocale } from './inLanguage'

describe('inLanguage', () => {
  it('returns es-ES for es', () => {
    expect(inLanguage('es')).toBe('es-ES')
  })
  it('returns en-US for en', () => {
    expect(inLanguage('en')).toBe('en-US')
  })
  it('returns en-US for unknown locale', () => {
    expect(inLanguage('fr')).toBe('en-US')
  })
})

describe('ogLocale', () => {
  it('returns es_ES for es', () => {
    expect(ogLocale('es')).toBe('es_ES')
  })
  it('returns en_US for en', () => {
    expect(ogLocale('en')).toBe('en_US')
  })
  it('returns en_US for unknown locale', () => {
    expect(ogLocale('fr')).toBe('en_US')
  })
})

describe('buildAlternates', () => {
  it('builds alternates for en home', () => {
    expect(buildAlternates('en', '')).toEqual({
      canonical: 'https://www.sawl.dev/en/',
      languages: {
        'en-US': 'https://www.sawl.dev/en/',
        'en-GB': 'https://www.sawl.dev/en/',
        'es-ES': 'https://www.sawl.dev/es/',
        'x-default': 'https://www.sawl.dev/en/',
      },
    })
  })
  it('builds alternates for es with slug', () => {
    expect(buildAlternates('es', 'contact/')).toEqual({
      canonical: 'https://www.sawl.dev/es/contact/',
      languages: {
        'en-US': 'https://www.sawl.dev/en/contact/',
        'en-GB': 'https://www.sawl.dev/en/contact/',
        'es-ES': 'https://www.sawl.dev/es/contact/',
        'x-default': 'https://www.sawl.dev/en/contact/',
      },
    })
  })
})
