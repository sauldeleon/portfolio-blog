/**
 * @jest-environment node
 */
import { renderHook } from '@testing-library/react-hooks/server'

import { useDefaultLanguage } from './useDefaultLanguage'

const mockData = { fallbackLng: 'en', languages: ['en', 'es'] }

describe('useDefaultLanguage SSR', () => {
  it('should return default language to fallback on SSR with no window', () => {
    const { result } = renderHook(() => useDefaultLanguage(mockData))
    expect(result.current).toEqual('en')
  })
})
