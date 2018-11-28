import base from './rollup.config.base'
import { uglify } from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo.min.js',
    format: 'iife',
    name: 'VueApollo',
  },
})

config.plugins.push(uglify({}, minify))

export default config
