// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'node_modules/',
    'dist/',
    'generated/',
    '!.*',
    'schema.graphql',
    '.test-todo/',
    '**/types/test/',
  ],

  rules: {
    'ts/no-use-before-define': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'accessor-pairs': 'off',
  },
}, {
  files: [
    'packages/docs/**',
  ],
  rules: {
    'no-dupe-keys': 'off',
    'no-new': 'off',
    'no-console': 'off',
  },
}, {
  files: [
    'packages/test-*/**',
    '**/*.test.*',
  ],
  rules: {
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
    'unused-imports/no-unused-vars': 'off',
    'node/prefer-global/process': 'off',
    'import/no-mutable-exports': 'off',
  },

  languageOptions: {
    globals: {
      cy: false,
      expect: false,
      describe: false,
      it: false,
      before: false,
    },
  },
}, {
  files: [
    '**/tests/types/**',
  ],
  rules: {
    'ts/no-unused-expressions': 'off',
  },
})
