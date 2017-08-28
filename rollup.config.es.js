import base from './rollup.config.base'

const config = Object.assign({}, base, {
  dest: 'dist/vue-apollo.esm.js',
  format: 'es',
})

export default config
