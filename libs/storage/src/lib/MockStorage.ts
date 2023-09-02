import { Storage } from './Storage'

export class MockStorage<T> implements Storage<T> {
  getItem() {
    return undefined
  }
  setItem() {}
}
