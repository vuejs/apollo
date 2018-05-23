import oThrottle from 'throttle-debounce/throttle'
import oDebounce from 'throttle-debounce/debounce'

export const Globals = {}

function factory (action) {
  return (cb, time) => action(time, cb)
}

export const throttle = factory(oThrottle)

export const debounce = factory(oDebounce)

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
