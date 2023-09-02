import { renderHook } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { LocalStorage } from './LocalStorage'
import { MockStorage } from './MockStorage'
import { useStorage } from './useStorage'

class LocalStorageMock {
  store: Record<string, unknown> = {}

  constructor(initialState = {}) {
    this.store = initialState
  }

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: unknown) {
    this.store[key] = value + ''
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}

describe('useStorage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: new LocalStorageMock(),
      writable: true,
    })

    jest.spyOn(console, 'warn').mockImplementation(() => jest.fn())
    jest.spyOn(console, 'error').mockImplementation(() => jest.fn())
    jest.spyOn(console, 'log').mockImplementation(() => jest.fn())
  })

  it('MockStorage - should return initial value correctly', () => {
    const storage = new MockStorage()
    const { result } = renderHook(() =>
      useStorage<string>({ storage, key: 'key', initialValue: 'initialValue' })
    )
    const [value] = result.current
    expect(value).toEqual('initialValue')
  })

  it('MockStorage - should not modify value', () => {
    const storage = new MockStorage()
    const { result, rerender } = renderHook(() =>
      useStorage<string>({ storage, key: 'key', initialValue: 'initialValue' })
    )

    const [value, setValue] = result.current
    act(() => setValue('newValue'))
    rerender()
    expect(value).toEqual('initialValue')
  })

  it('LocalStorage - should return a initial value correctly', () => {
    const storage = new LocalStorage<string>()
    const { result } = renderHook(() =>
      useStorage<string>({ storage, key: 'key', initialValue: 'initialValue' })
    )
    const [value] = result.current

    expect(value).toEqual('initialValue')
  })

  it('LocalStorage - should return a undefined value correctly', () => {
    const storage = new LocalStorage<string>()
    const { result } = renderHook(() =>
      useStorage<string>({ storage, key: 'key' })
    )
    const [value] = result.current

    expect(value).toEqual(undefined)
  })

  it('LocalStorage - should modify value', () => {
    const storage = new LocalStorage<string>()
    const { result } = renderHook(() =>
      useStorage<string>({ storage, key: 'key', initialValue: 'initialValue' })
    )

    const [, setValue] = result.current
    act(() => {
      setValue('newValue')
    })
    expect(window.localStorage.getItem('key')).toBe(JSON.stringify('newValue'))
  })
})
