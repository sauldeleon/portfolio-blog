import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { type ViteUserConfig, defineConfig, mergeConfig } from 'vitest/config'

const workspaceRoot = import.meta.dirname
const isCI = !!process.env.CI
const TEST_GLOB = '**/*.{spec,test}.{js,jsx,ts,tsx}'

/**
 * Shared Vitest config for every project in the monorepo.
 * Mirrors the previous `jest.preset.js` (100% coverage threshold, jsdom,
 * shared setup file, CI reporters).
 */
export function createVitestConfig(
  projectDir: string,
  overrides: ViteUserConfig = {},
) {
  const projectRoot = path.relative(workspaceRoot, projectDir)
  const name = path.basename(projectDir)
  // Like Jest's passWithNoTests: projects without specs skip the coverage gate.
  const hasTests =
    fs.globSync(TEST_GLOB, {
      cwd: projectDir,
      exclude: (p) => p.includes('node_modules'),
    }).length > 0

  const base = defineConfig({
    root: projectDir,
    cacheDir: path.join(workspaceRoot, 'node_modules/.vite', projectRoot),
    plugins: [react()],
    resolve: {
      tsconfigPaths: true,
      alias: {
        'next/font/local': path.join(
          workspaceRoot,
          'tools/vitest/next-font-local.mock.ts',
        ),
      },
    },
    test: {
      name,
      globals: true,
      environment: 'jsdom',
      // Same document URL Jest's jsdom environment used.
      environmentOptions: { jsdom: { url: 'http://localhost/' } },
      include: [TEST_GLOB],
      passWithNoTests: true,
      // Specs that import the module under test inside each test pay its
      // first (uncached) transform within that test's timeout.
      testTimeout: 10_000,
      // Vite exposes its own `BASE_URL` (the `base` option) and Vitest copies it
      // into process.env, clobbering the app's BASE_URL from .env files.
      env: process.env.BASE_URL ? { BASE_URL: process.env.BASE_URL } : {},
      exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
      setupFiles: [path.join(workspaceRoot, 'vitest.setup.ts')],
      reporters: isCI
        ? [
            'default',
            [
              'junit',
              {
                outputFile: path.join(
                  workspaceRoot,
                  'coverage',
                  projectRoot,
                  'junit.xml',
                ),
              },
            ],
          ]
        : ['default'],
      coverage: {
        provider: 'istanbul',
        reportsDirectory: path.join(workspaceRoot, 'coverage', projectRoot),
        reporter: ['text', 'json', isCI ? 'cobertura' : 'html'],
        include: ['**/*.{js,jsx,ts,tsx}'],
        exclude: [
          '**/node_modules/**',
          '**/.next/**',
          '*.config.{js,ts,mjs}',
          '**/*.d.ts',
          '**/*.json',
          '**/*.{spec,test}.{js,jsx,ts,tsx}',
          '**/app/*_*.tsx',
          '**/src/index.ts',
          '**/*.mock.{ts,tsx}',
          '**/*.handlers.{ts,tsx}',
          '**/__mocks__/**',
        ],
        thresholds: hasTests
          ? { branches: 100, functions: 100, lines: 100, statements: 100 }
          : undefined,
      },
    },
  })

  return mergeConfig(base, overrides)
}
