import {nostandard} from 'eslint-nostandard'
import vitest from 'eslint-nostandard/vitest'
import globals from 'globals'

export default [
  ...nostandard.recommended,
  vitest,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'camelcase': 'off',
      'complexity': 'off',
      'prefer-template': 'off',
      'max-params': ['warn', {max: 4}],
      '@stylistic/max-len': ['warn', {code: 140}],
    },
  },
]
