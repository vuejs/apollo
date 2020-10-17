module.exports = {
  root: true,
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.lint.json',
  },
  rules: {
    // trailing comma
    'comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/promise-function-async': 'off',
  },
}
