import cypress from 'eslint-plugin-cypress'

import baseConfig from '../../eslint.config.mjs'

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...baseConfig,
  cypress.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {},
  },
]
