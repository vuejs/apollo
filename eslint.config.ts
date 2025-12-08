import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    ignores: ['src/docs'],
    rules: {
      'ts/no-namespace': 'off',
      'ts/no-empty-object-type': 'off',
      'import/first': 'off',
    },
  },
  {
    files: ['src/docs/**/*'],
    rules: {
      'import/first': 'off',
    },
  },
)
