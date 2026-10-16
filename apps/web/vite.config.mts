import { createVitestConfig } from '../../vitest.shared.mts'

export default createVitestConfig(import.meta.dirname, {
  resolve: {
    alias: {
      '@react-pdf/renderer': `${import.meta.dirname}/__mocks__/react-pdf-renderer.tsx`,
    },
  },
  test: {
    setupFiles: [`${import.meta.dirname}/vitest.setup.ts`],
    coverage: {
      exclude: [
        'lib/db/schema.ts',
        'lib/db/migrations/**',
        'lib/types/**',
        'types/**',
        'components/GlobalStyles/**',
        'components/PostContent/PostContent.styles.ts',
        'components/PostContent/MdxTable.styles.ts',
        // Mocked by their page specs, so never executed.
        'app/[[]lng]/blog/[[]id]/[[]slug]/page.next.styles.ts',
        'app/blog/preview/[[]token]/page.next.styles.ts',
        '**/index.ts',
      ],
    },
  },
})
