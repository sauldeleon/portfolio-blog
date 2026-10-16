import { preferredLanguage } from './preferredLanguage'

describe('preferredLanguage', () => {
  it('honours the language the visitor picked', () => {
    expect(preferredLanguage('es', 'en-GB,en;q=0.9')).toBe('es')
  })

  it('ignores a cookie with an unsupported language', () => {
    expect(preferredLanguage('de', 'es-ES')).toBe('es')
  })

  it('picks the best supported Accept-Language match by quality', () => {
    expect(preferredLanguage(undefined, 'de;q=1, es;q=0.8, en;q=0.5')).toBe(
      'es',
    )
    expect(preferredLanguage(undefined, 'en;q=0.4, es-ES;q=0.9')).toBe('es')
  })

  it('skips languages with q=0', () => {
    expect(preferredLanguage(undefined, 'es;q=0, en')).toBe('en')
  })

  it('falls back when nothing matches or no header is sent', () => {
    expect(preferredLanguage(undefined, 'fr-FR, de')).toBe('en')
    expect(preferredLanguage(undefined, null)).toBe('en')
    expect(preferredLanguage(undefined, '')).toBe('en')
  })
})
