export class LocalStorageMock {
  store: Record<string, unknown> = {}

  constructor(initialState = {}) {
    this.store = initialState
  }

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: unknown) {
    this.store[key] = value + ''
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}
