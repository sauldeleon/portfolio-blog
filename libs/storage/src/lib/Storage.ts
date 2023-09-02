export interface Storage<T> {
  getItem(key: string): T | undefined
  setItem(key: string, value: T | undefined): void
}
