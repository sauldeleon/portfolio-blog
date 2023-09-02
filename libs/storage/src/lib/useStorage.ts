import { useEffect, useState } from 'react'

import { Storage } from './Storage'

interface UseStorageProps<T> {
  storage: Storage<T>
  key: string
  initialValue?: T
}

export function useStorage<T>({
  storage,
  key,
  initialValue,
}: UseStorageProps<T>) {
  const [value, setValue] = useState<T | undefined>(() => {
    const value = storage.getItem(key)
    if (!value) {
      storage.setItem(key, initialValue)
      return initialValue
    }
    return value
  })

  useEffect(() => {
    storage.setItem(key, value)
  }, [key, storage, value])

  return [value, setValue] as const
}
