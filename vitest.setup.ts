import '@testing-library/jest-dom/vitest'
import 'jest-styled-components/vitest'

// @testing-library's waitFor/findBy only detect fake timers through a global
// `jest` object; expose the bit it needs so they advance Vitest's fake timers.
Object.assign(globalThis, {
  jest: { advanceTimersByTime: (ms: number) => vi.advanceTimersByTime(ms) },
})

beforeEach(() => {
  vi.clearAllMocks()
})
