import nx from '@nx/eslint-plugin'
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import globals from 'globals'

import baseConfig from '../../eslint.config.mjs'

// Strip plugins already registered by baseConfig/nx to avoid "Cannot redefine plugin" errors
const SKIP_PLUGINS = new Set([
  'react',
  'react-hooks',
  'import',
  'jsx-a11y',
  '@typescript-eslint',
])
const nextConfigs = coreWebVitals.map((cfg) => {
  if (!cfg.plugins) return cfg
  const plugins = Object.fromEntries(
    Object.entries(cfg.plugins).filter(([k]) => !SKIP_PLUGINS.has(k)),
  )
  if (!Object.keys(plugins).length) {
    // eslint-disable-next-line no-unused-vars
    const { plugins: _plugins, ...rest } = cfg
    return rest
  }
  return { ...cfg, plugins }
})

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '**/.next', '**/.prettierrc.js'],
  },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  ...nextConfigs,
  { languageOptions: { globals: { ...globals.jest } } },
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@next/next/no-html-link-for-pages': ['error', 'apps/web/pages'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
]
