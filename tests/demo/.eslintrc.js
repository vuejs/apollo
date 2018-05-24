module.exports = {
  root: true,

  env: {
    node: true
  },

  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],

  rules: {
    'graphql/template-strings': [
      'error',
      {
        env: 'literal'
      }
    ],
    'comma-dangle': ['error', 'always-multiline'],
  },

  parserOptions: {
    parser: 'babel-eslint'
  },

  plugins: [
    'graphql'
  ]
}
