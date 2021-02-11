const { join } = require('path')

module.exports = {
  root: true,
  extends: 'standard-with-typescript',
  parserOptions: {
    project: join(__dirname, './tsconfig.lint.json'),
  },
  rules: {
    // trailing comma
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
  },
}
