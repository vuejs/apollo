export function useEventHook<TParam = any> () {
  const fns: Array<(param: TParam) => void> = []

  function on (fn: (param: TParam) => void) {
    fns.push(fn)
    return {
      off: () => off(fn),
    }
  }

  function off (fn: (param: TParam) => void) {
    const index = fns.indexOf(fn)
    if (index !== -1) {
      fns.splice(index, 1)
    }
  }

  function trigger (param: TParam) {
    for (const fn of fns) {
      fn(param)
    }
  }

  function getCount () {
    return fns.length
  }

  return {
    on,
    off,
    trigger,
    getCount,
  }
}
