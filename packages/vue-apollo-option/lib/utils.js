const TD = require('throttle-debounce')

function factory (action) {
  return (cb, time) => action(time, cb)
}

exports.throttle = factory(TD.throttle)

exports.debounce = factory(TD.debounce)

exports.reapply = function (options, context) {
  while (typeof options === 'function') {
    options = options.call(context)
  }
  return options
}

exports.omit = function (obj, properties) {
  return Object.entries(obj)
    .filter(([key]) => !properties.includes(key))
    .reduce((c, [key, val]) => {
      c[key] = val
      return c
    }, {})
}

exports.addGqlError = function (error) {
  if (error.graphQLErrors && error.graphQLErrors.length) {
    error.gqlError = error.graphQLErrors[0]
  }
}

exports.noop = () => {}
