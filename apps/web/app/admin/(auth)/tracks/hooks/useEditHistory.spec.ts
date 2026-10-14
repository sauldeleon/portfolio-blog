import { act, renderHook } from '@testing-library/react'

import { useEditHistory } from './useEditHistory'

describe('useEditHistory', () => {
  it('starts with the initial value and nothing to undo or redo', () => {
    const { result } = renderHook(() => useEditHistory(1))
    expect(result.current.present).toBe(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('records changes and supports undo/redo', () => {
    const { result } = renderHook(() => useEditHistory(1))
    act(() => result.current.set(2))
    act(() => result.current.set((n) => n + 1))
    expect(result.current.present).toBe(3)
    act(() => result.current.undo())
    expect(result.current.present).toBe(2)
    expect(result.current.canRedo).toBe(true)
    act(() => result.current.redo())
    expect(result.current.present).toBe(3)
    act(() => result.current.undo())
    act(() => result.current.set(10))
    expect(result.current.canRedo).toBe(false)
  })

  it('ignores no-op updates and empty undo/redo', () => {
    const { result } = renderHook(() => useEditHistory(1))
    act(() => result.current.set(1))
    act(() => result.current.undo())
    act(() => result.current.redo())
    expect(result.current.present).toBe(1)
    expect(result.current.canUndo).toBe(false)
  })

  it('caps the history length', () => {
    const { result } = renderHook(() => useEditHistory(0))
    for (let i = 1; i <= 105; i++) act(() => result.current.set(i))
    for (let i = 0; i < 200; i++) act(() => result.current.undo())
    expect(result.current.present).toBe(5)
  })
})
