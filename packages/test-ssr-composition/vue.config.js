/** @type {import('@vue/cli-service').ProjectOptions} */
module.exports = {
  pluginOptions: {
    apollo: {
      enableMocks: false,
      enableEngine: false,
    },
  },

  chainWebpack (config) {
    config.resolve.symlinks(false)
    config.externals([
      'utf-8-validate',
      'bufferutil',
    ])
    config.module.noParse([
      /iconv-loader/,
    ])
    config.resolve.alias.set('vue-demi', '@vue/composition-api')
  },
}
