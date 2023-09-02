import { Storage } from './Storage'
import { parseJSON } from './utils'

export class LocalStorage<T> implements Storage<T> {
  getItem(key: string) {
    const item = localStorage.getItem(key)
    return parseJSON<T>(item)
  }
  setItem(key: string, value: T) {
    if (value === undefined) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  }
}
