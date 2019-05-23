const serializeJs = require('serialize-javascript');

exports.serializeStates = function(apolloProvider, options = {}) {
  const state = exports.getStates(apolloProvider, options)

  return options.useUnsafeSerializer
    ? JSON.stringify(state)
    : serializeJs(state)
}

exports.getStates = function (apolloProvider, options = {}) {
  const finalOptions = Object.assign({}, {
    exportNamespace: '',
  }, options)
  const states = {}
  for (const key in apolloProvider.clients) {
    const client = apolloProvider.clients[key]
    const state = client.cache.extract()
    states[`${finalOptions.exportNamespace}${key}`] = state
  }
  return states
}

exports.exportStates = function (apolloProvider, options) {
  const finalOptions = Object.assign({}, {
    globalName: '__APOLLO_STATE__',
    attachTo: 'window',
    useUnsafeSerializer: false,
  }, options);

  return `${finalOptions.attachTo}.${finalOptions.globalName} = ${exports.serializeStates(apolloProvider, options)};`
}
