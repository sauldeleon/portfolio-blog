import { Storage } from './Storage'
import { parseJSON } from './utils'

const map = new Map<string, string>()
export class MockStorage implements Storage {
  getItem<T>(key: string, defaultValue: T | null = null) {
    const item = map.get(key)
    return item ? parseJSON<T>(item) : defaultValue
  }
  setItem(key: string, value: unknown) {
    map.set(key, typeof value === 'string' ? value : JSON.stringify(value))
  }
  removeItem(key: string) {
    map.delete(key)
  }
}
