import { act, renderHook } from '@testing-library/react'

import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } },
    )
    rerender({ value: 'world' })
    expect(result.current).toBe('hello')
  })

  it('updates value after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } },
    )
    rerender({ value: 'world' })
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe('world')
  })

  it('resets timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'ab' })
    act(() => {
      jest.advanceTimersByTime(100)
    })
    rerender({ value: 'abc' })
    act(() => {
      jest.advanceTimersByTime(100)
    })
    expect(result.current).toBe('a')
    act(() => {
      jest.advanceTimersByTime(300)
    })
    expect(result.current).toBe('abc')
  })

  it('works with number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 1 } },
    )
    rerender({ value: 42 })
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe(42)
  })
})
