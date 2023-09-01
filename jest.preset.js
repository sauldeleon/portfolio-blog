const nxPreset = require('@nx/jest/preset').default
const path = require('path')

const isCI = !!process.env.CI

/** @type {import('@nx/jest/preset').nxPreset['coverageReporters']} */
let coverageReporters = ['text', 'json', isCI ? 'cobertura' : 'html']
const reporters = ['default']
if (isCI) {
  reporters.push([
    'jest-junit',
    {
      outputDirectory: 'coverage',
    },
  ])
}

/** @type {import('@nx/jest/preset').nxPreset} */
module.exports = {
  ...nxPreset,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [path.resolve(__dirname, 'jest.setupafterenv.ts')],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!*.config.js',
    '!jest.config.ts',
    '!*.d.ts',
    '!**/app/*_*.tsx',
    '!**/src/index.ts',
    '!**/**.mock.{ts,tsx}',
    '!**/**.handlers.{ts,tsx}',
  ],
  modulePathIgnorePatterns: ['.next'],
  coverageReporters,
  reporters,
  collectCoverage: false,
}
