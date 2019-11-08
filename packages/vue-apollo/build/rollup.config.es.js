import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo.esm.js',
    format: 'es',
    name: 'vue-apollo',
  },
})

export default config
