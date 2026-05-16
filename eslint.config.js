import {nostandard} from 'eslint-nostandard'

export default [
  ...nostandard.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules: {
      'camelcase': 'off',
      'complexity': 'off',
      'prefer-template': 'off',
      '@stylistic/js/max-len': ['warn', {code: 140}],
    },
  },
]
