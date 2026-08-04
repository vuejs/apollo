import antfu from '@antfu/eslint-config'

export default antfu(
  {
    vue: true,
    typescript: true,
    ignores: [
      'src/docs',
      'packages/vue-apollo-composable/.api-reports',
      'packages/docs/api',
    ],
    rules: {
      'ts/no-namespace': 'off',
      'ts/no-empty-object-type': 'off',
      'import/first': 'off',
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/v-on-event-hyphenation': ['error', 'never'],
    },
  },
  {
    files: ['src/docs/**/*'],
    rules: {
      'import/first': 'off',
    },
  },
)
