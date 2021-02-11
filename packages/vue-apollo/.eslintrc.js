module.exports = {
  root: true,
  env: {
    browser: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/standard',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  globals: {
    name: 'off',
  },
  rules: {
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'no-var': ['error'],
    '@typescript-eslint/member-delimiter-style': [
      'error',
      {
        multiline: {
          delimiter: 'none',
        },
        singleline: {
          delimiter: 'comma',
        },
      },
    ],
    '@typescript-eslint/no-use-before-define': 'off',
    'comma-dangle': ['error', 'always-multiline'],
    'vue/no-multiple-template-root': 'off',
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'no-use-before-define': 'warn',
    'no-return-assign': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['tests/unit/*.js', 'ssr/*', 'build/*', 'lib/*'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    '!.*',
    'schema.graphql',
    'types/test/*.js',
  ],
}
