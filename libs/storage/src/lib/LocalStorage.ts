import { Storage } from './Storage'
import { parseJSON } from './utils'

export class LocalStorage implements Storage {
  getItem<T>(key: string, defaultValue: T | null = null) {
    const item = localStorage.getItem(key)
    return item ? parseJSON<T>(item) : defaultValue
  }
  setItem(key: string, value: unknown) {
    localStorage.setItem(
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    )
  }
  removeItem(key: string) {
    localStorage.removeItem(key)
  }
}
