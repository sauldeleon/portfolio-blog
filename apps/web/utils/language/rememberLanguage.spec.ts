import { rememberLanguage } from './rememberLanguage'

describe('rememberLanguage', () => {
  it('stores the language in a year-long, site-wide cookie', () => {
    const setCookie = vi.spyOn(document, 'cookie', 'set')
    rememberLanguage('es')
    expect(setCookie).toHaveBeenCalledWith(
      'webLng=es; path=/; max-age=31536000; samesite=lax',
    )
    setCookie.mockRestore()
  })
})
