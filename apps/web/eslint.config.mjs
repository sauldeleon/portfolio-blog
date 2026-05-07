import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nx from '@nx/eslint-plugin'
import globals from 'globals'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

import baseConfig from '../../eslint.config.mjs'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
})

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '**/.next', '**/.prettierrc.js'],
  },
  ...baseConfig,
  ...nx.configs['flat/react-typescript'],
  ...compat.extends('plugin:@next/next/recommended', 'next/core-web-vitals'),
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
