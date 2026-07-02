import cypress from 'eslint-plugin-cypress'

import baseConfig from './eslint.config.mjs'

export default [
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error'],
    },
  },
  // Mirror the web-e2e project lint so Cypress rules (and their inline
  // disables) resolve when Husky lints staged spec files.
  {
    ...cypress.configs.recommended,
    files: ['apps/web-e2e/**/*.{js,ts,jsx,tsx}'],
  },
]
