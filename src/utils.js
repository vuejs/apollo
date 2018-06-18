import * as TD from 'throttle-debounce'

export const Globals = {}

function factory (action) {
  return (cb, time) => action(time, cb)
}

export const throttle = factory(TD.throttle)

export const debounce = factory(TD.debounce)

export function getMergedDefinition (def) {
  return Globals.Vue.util.mergeOptions({}, def)
}

export function reapply (options, context) {
  while (typeof options === 'function') {
    options = options.call(context)
  }
  return options
}

export function omit (obj, properties) {
  return Object.entries(obj)
    .filter(([key]) => !properties.includes(key))
    .reduce((c, [key, val]) => {
      c[key] = val
      return c
    }, {})
}

export function addGqlError (error) {
  if (error.graphQLErrors && error.graphQLErrors.length) {
    error.gqlError = error.graphQLErrors[0]
  }
}
