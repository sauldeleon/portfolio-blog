import { renderHook, waitFor } from '@testing-library/react'

import { useIsBot } from './use-is-bot'

jest.mock('@fingerprintjs/botd', () => ({
  load: jest.fn().mockResolvedValue({
    detect: jest.fn().mockResolvedValue(false),
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
    const mockFn = jest.fn()
    renderHook(() => useIsBot({ afterDetection: mockFn }))
    await waitFor(() => expect(mockFn).toHaveBeenCalledTimes(1))
  })
})
