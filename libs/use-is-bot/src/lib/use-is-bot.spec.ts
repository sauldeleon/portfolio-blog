import { load } from '@fingerprintjs/botd'
import { renderHook, waitFor } from '@testing-library/react'
import type { Mock } from 'vitest'

import { useIsBot } from './use-is-bot'

vi.mock('@fingerprintjs/botd', () => ({
  load: vi.fn().mockResolvedValue({
    detect: vi.fn().mockResolvedValue(false),
  }),
}))

describe('UseIsBot', () => {
  it('should be initialized successfully', async () => {
    const { result } = renderHook(() => useIsBot())
    await waitFor(() =>
      expect(result.current).toEqual({ isBot: true, isLoading: true }),
    )
  })

  it('should be set loading to false when detection is hover', async () => {
    const { result } = renderHook(() => useIsBot())

    await waitFor(() =>
      expect(result.current).toEqual({ isBot: true, isLoading: true }),
    )
    await waitFor(() =>
      expect(result.current).toEqual({ isBot: undefined, isLoading: false }),
    )
  })

  it('should execute callback when detection is over', async () => {
    const mockFn = vi.fn()
    renderHook(() => useIsBot({ afterDetection: mockFn }))
    await waitFor(() => expect(mockFn).toHaveBeenCalledTimes(1))
  })

  it('should set isLoading to false when botd load rejects', async () => {
    ;(load as Mock).mockRejectedValueOnce(new Error('fail'))
    const { result } = renderHook(() => useIsBot())
    await waitFor(() =>
      expect(result.current).toEqual({ isBot: true, isLoading: false }),
    )
  })
})
