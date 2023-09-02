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
    return value || initialValue
  })

  useEffect(() => {
    storage.setItem(key, value)
  }, [key, storage, value])

  return [value, setValue] as const
}
