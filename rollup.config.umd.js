import base from './rollup.config.base'

const config = Object.assign({}, base, {
  dest: 'dist/vue-apollo.umd.js',
  format: 'umd',
})

export default config
