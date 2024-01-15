import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo-option.esm.mjs',
    format: 'es',
    name: 'vue-apollo',
  },
})

export default config
