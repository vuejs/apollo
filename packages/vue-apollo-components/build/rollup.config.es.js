import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    file: 'dist/vue-apollo-components.esm.mjs',
    format: 'es',
    name: 'vue-apollo-components',
  },
})

export default config
