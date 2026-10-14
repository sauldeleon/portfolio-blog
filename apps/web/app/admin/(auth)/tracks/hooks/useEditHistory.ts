import { useCallback, useState } from 'react'

const MAX_HISTORY = 100

interface History<T> {
  past: T[]
  present: T
  future: T[]
}

/** Undo/redo stack over immutable snapshots. */
export function useEditHistory<T>(initial: T) {
  const [history, setHistory] = useState<History<T>>({
    past: [],
    present: initial,
    future: [],
  })

  const set = useCallback((update: T | ((current: T) => T)) => {
    setHistory((h) => {
      const next =
        typeof update === 'function'
          ? (update as (current: T) => T)(h.present)
          : update
      if (next === h.present) return h
      return {
        past: [...h.past, h.present].slice(-MAX_HISTORY),
        present: next,
        future: [],
      }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((h) =>
      h.past.length === 0
        ? h
        : {
            past: h.past.slice(0, -1),
            present: h.past[h.past.length - 1],
            future: [h.present, ...h.future],
          },
    )
  }, [])

  const redo = useCallback(() => {
    setHistory((h) =>
      h.future.length === 0
        ? h
        : {
            past: [...h.past, h.present],
            present: h.future[0],
            future: h.future.slice(1),
          },
    )
  }, [])

  return {
    present: history.present,
    set,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  }
}
