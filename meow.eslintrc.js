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
    'indent': 'off',
    '@typescript-eslint/indent': ['error', 2],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'no-use-before-define': 'warn',
    'accessor-pairs': 'off',
    'no-async-promise-executor': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    'no-return-assign': 'off',
    'multiline-ternary': 'off',
  },
  overrides: [
    {
      files: ['*.vue'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: [
        'packages/*/server.js',
        'packages/*/apollo.config.js',
        'packages/*/apollo-server/**/*',
        'packages/*/tests/**/*.js',
        'packages/*/build/**/*.js',
        'packages/*/lib/**/*.js',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: [
        '**/*.test.ts',
        'packages/*/types/test/**/*.ts',
      ],
      rules: {
        'camelcase': 'off',
        'no-unused-expressions': 'off',
        'array-callback-return': 'warn',
      },
    },
    {
      files: [
        'packages/**/*.js',
      ],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'generated/',
    '!.*',
    'schema.graphql',
    '/.test-todo/',
    '**/types/test/',
  ],
}
