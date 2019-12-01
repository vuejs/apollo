import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo-option.umd.js',
    format: 'umd',
    name: 'vue-apollo',
  },
})

export default config
