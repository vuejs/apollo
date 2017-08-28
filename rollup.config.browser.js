import base from './rollup.config.base'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-js-harmony'

const config = Object.assign({}, base, {
  dest: 'dist/vue-apollo.min.js',
  format: 'iife',
  moduleName: 'VueApollo',
})

config.plugins.push(uglify({}, minify))

export default config
