import loThrottle from 'lodash.throttle'
import loDebounce from 'lodash.debounce'

export const Globals = {}

function factory (action) {
  return (cb, options) => {
    if (typeof options === 'number') {
      return action(cb, options)
    } else {
      return action(cb, options.wait, options)
    }
  }
}

export const throttle = factory(loThrottle)

export const debounce = factory(loDebounce)

export function getMergedDefinition (def) {
  return Globals.Vue.util.mergeOptions({}, def)
}
