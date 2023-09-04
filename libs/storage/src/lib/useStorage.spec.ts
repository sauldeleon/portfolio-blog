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
    const { result } = renderHook(() => useStorage(storage))
    const [getItem] = result.current
    getItem('key', 'initialValue')
    expect(getItem('key', 'initialValue')).toEqual('initialValue')
  })

  it('MockStorage - should not modify value', () => {
    const storage = new MockStorage()
    const { result } = renderHook(() => useStorage(storage))

    const [getItem, setItem] = result.current
    act(() => setItem('key1', { a: 1 }))
    act(() => setItem('key2', 'newValue2'))
    expect(getItem<object>('key1')).toEqual({ a: 1 })
    expect(getItem<string>('key2')).toEqual('newValue2')
  })

  it('MockStorage - should remove an item', () => {
    const storage = new MockStorage()
    const { result } = renderHook(() => useStorage(storage))

    const [getItem, setItem, removeItem] = result.current
    act(() => setItem('key1', { a: 1 }))
    act(() => removeItem('key1'))
    expect(getItem<object>('key1')).toBeNull()
  })

  it('LocalStorage - should return a initial value correctly', () => {
    const storage = new LocalStorage()
    const { result } = renderHook(() => useStorage(storage))
    const [getItem] = result.current

    expect(getItem('key', 'initialValue')).toEqual('initialValue')
  })

  it('LocalStorage - should return an item correctly', () => {
    const storage = new LocalStorage()
    const { result } = renderHook(() => useStorage(storage))
    const [getItem, setItem] = result.current
    setItem('key', 'newValue')
    expect(getItem('key', 'initialValue')).toEqual('newValue')
  })

  it('LocalStorage - should return a null value correctly', () => {
    const storage = new LocalStorage()
    const { result } = renderHook(() => useStorage(storage))
    const [getItem] = result.current

    expect(getItem('key')).toBeNull()
  })

  it('LocalStorage - should modify value', () => {
    window.localStorage.setItem('key', 'initialValue')
    const storage = new LocalStorage()
    const { result } = renderHook(() => useStorage(storage))

    const [, setItem] = result.current
    act(() => {
      setItem('key', 'newValue')
    })
    expect(window.localStorage.getItem('key')).toBe('newValue')
  })

  it('LocalStorage - should store an object correctly', () => {
    window.localStorage.setItem('key', 'initialValue')
    const storage = new LocalStorage()
    const { result } = renderHook(() => useStorage(storage))

    const [, setValue] = result.current
    act(() => {
      setValue('object', { key: 'value2' })
    })
    expect(window.localStorage.getItem('object')).toBe('{"key":"value2"}')
  })

  it('LocalStorage - should remove an item', () => {
    const storage = new LocalStorage()
    const { result } = renderHook(() => useStorage(storage))

    const [getItem, setItem, removeItem] = result.current
    act(() => setItem('key1', { a: 1 }))
    act(() => removeItem('key1'))
    expect(getItem<object>('key1')).toBeNull()
  })
})
