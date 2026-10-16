import { createVitestConfig } from '../../vitest.shared.mts'

export default createVitestConfig(import.meta.dirname, {
  resolve: {
    alias: {
      'next-cloudinary': `${import.meta.dirname}/src/lib/__mocks__/next-cloudinary.tsx`,
    },
  },
})
