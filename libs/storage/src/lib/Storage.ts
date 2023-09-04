export interface Storage {
  getItem<T>(key: string): T | null
  getItem<T>(key: string, defaultValue?: T | null): T | null

  setItem(key: string, value: unknown): void

  removeItem(key: string): void
}
