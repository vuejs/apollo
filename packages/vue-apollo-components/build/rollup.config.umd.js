import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo-components.umd.js',
    format: 'umd',
    name: 'vue-apollo-components',
  },
})

export default config
