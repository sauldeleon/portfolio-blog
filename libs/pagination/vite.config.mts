import { createVitestConfig } from '../../vitest.shared.mts'

export default createVitestConfig(import.meta.dirname, {
  resolve: {
    alias: {
      'next/navigation': `${import.meta.dirname}/src/lib/__mocks__/next-navigation.ts`,
    },
  },
})
