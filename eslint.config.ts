import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: ['.old'],
  rules: {
    'ts/no-namespace': 'off',
    'ts/no-empty-object-type': 'off',
  },
})
