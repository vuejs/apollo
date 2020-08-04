import base from './rollup.config.base'
import { terser } from 'rollup-plugin-terser'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo-components.min.js',
    format: 'iife',
    name: 'VueApolloComponents',
  },
})

config.plugins.push(terser())

export default config
