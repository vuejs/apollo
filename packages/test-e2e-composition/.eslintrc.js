module.exports = {
  root: true,

  env: {
    node: true,
  },

  'extends': [
    'plugin:vue/recommended',
    '@vue/standard',
  ],

  rules: {
    'graphql/template-strings': [
      'error',
      {
        env: 'literal',
        projectName: 'app',
      },
    ],
    'comma-dangle': ['error', 'always-multiline'],
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  plugins: [
    'graphql',
  ],
}
