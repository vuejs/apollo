module.exports = {
  pluginOptions: {
    graphqlMock: false,
    apolloEngine: false,
  },

  /* Without vue-cli-plugin-apollo 0.20.0+ */
  // chainWebpack: config => {
  //   config.module
  //     .rule('vue')
  //     .use('vue-loader')
  //       .loader('vue-loader')
  //       .tap(options => {
  //         options.transpileOptions = {
  //           transforms: {
  //             dangerousTaggedTemplateString: true,
  //           },
  //         }
  //         return options
  //       })
  // }
}
