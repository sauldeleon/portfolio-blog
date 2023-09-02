import { renderHook } from '@testing-library/react'

import { useDefaultLanguage } from './useDefaultLanguage'

describe('useDefaultLanguage', () => {
  let languageGetter: any
  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'language', 'get')
  })

  it('should return default language to en', () => {
    languageGetter.mockReturnValue('en-US')
    const { result } = renderHook(() => useDefaultLanguage())
    expect(result.current).toEqual('en')
  })

  it('should return default language to es', () => {
    languageGetter.mockReturnValue('es-ES')
    const { result } = renderHook(() => useDefaultLanguage())
    expect(result.current).toEqual('es')
  })

  it('should return default language to fallback', () => {
    languageGetter.mockReturnValue('de-DE')
    const { result } = renderHook(() => useDefaultLanguage())
    expect(result.current).toEqual('en')
  })

  it('should return default language to fallback on SSR', () => {
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      writable: true,
    })

    const { result } = renderHook(() => useDefaultLanguage())
    expect(result.current).toEqual('en')
  })
})
