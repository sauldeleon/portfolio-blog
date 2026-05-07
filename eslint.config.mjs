import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import nx from '@nx/eslint-plugin'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
})

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  { plugins: { '@nx': nx } },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          allowCircularSelfDependency: true,
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  ...nx.configs['flat/react'],
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
        },
      ],
    },
  },
  ...compat
    .config({
      plugins: ['testing-library'],
      extends: ['plugin:testing-library/react', 'plugin:testing-library/dom'],
    })
    .map((config) => ({
      ...config,
      files: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test|mock).[jt]s?(x)',
      ],
      rules: {
        ...config.rules,
        '@typescript-eslint/no-explicit-any': 'off',
      },
    })),
]
