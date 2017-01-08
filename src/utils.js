import loThrottle from 'lodash.throttle'
import loDebounce from 'lodash.debounce'

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
