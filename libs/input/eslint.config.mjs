import nx from '@nx/eslint-plugin'

import baseConfig from '../../eslint.config.mjs'

export default [
  { ignores: ['**/dist', '**/out-tsc'] },
  ...baseConfig,
  ...nx.configs['flat/react'],
  { files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'], rules: {} },
  { files: ['**/*.ts', '**/*.tsx'], rules: {} },
  { files: ['**/*.js', '**/*.jsx'], rules: {} },
]
