import { renderHook } from '@testing-library/react'
import { renderHook as renderHookSSR } from '@testing-library/react-hooks/server'

import { STORAGE_I18N_KEY } from '@sdlgr/i18n-config'
import { LocalStorageMock } from '@sdlgr/mocks'

import { useDefaultLanguage } from './useDefaultLanguage'

const mockData = { fallbackLng: 'en', languages: ['en', 'es'] }

describe('useDefaultLanguage', () => {
  let languageGetter: any
  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'language', 'get')
    Object.defineProperty(window, 'localStorage', {
      value: new LocalStorageMock(),
      writable: true,
    })
  })

  it('should return default language to en', () => {
    languageGetter.mockReturnValue('en-US')
    const { result } = renderHook(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('en')
  })

  it('should return default language to es', () => {
    languageGetter.mockReturnValue('es-ES')
    const { result } = renderHook(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('es')
  })

  it('should return default language to fallback om CSR', () => {
    languageGetter.mockReturnValue('de-DE')
    const { result } = renderHook(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('en')
  })

  it('should return stored language', () => {
    window.localStorage.setItem(STORAGE_I18N_KEY, 'ru')

    const { result } = renderHook(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('ru')
  })

  it('should return default language to fallback on SSR with no navigator', () => {
    Object.defineProperty(window, 'navigator', {
      value: undefined,
      writable: true,
    })

    const { result } = renderHook(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('en')
  })
})

describe('useDefaultLanguage SSR', () => {
  it('should return default language to fallback on SSR with no window', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
    })

    const { result } = renderHookSSR(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('en')
  })
})
