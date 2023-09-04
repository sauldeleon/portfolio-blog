import { Storage } from './Storage'

export function useStorage(storage: Storage) {
  return [storage.getItem, storage.setItem, storage.removeItem] as const
}
