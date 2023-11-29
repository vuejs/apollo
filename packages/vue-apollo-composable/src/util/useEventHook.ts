export function useEventHook<TParams extends any[] = any[]> () {
  const fns: Array<(...params: TParams) => void> = []

  function on (fn: (...params: TParams) => void) {
    fns.push(fn)
    return {
      off: () => off(fn),
    }
  }

  function off (fn: (...params: TParams) => void) {
    const index = fns.indexOf(fn)
    if (index !== -1) {
      fns.splice(index, 1)
    }
  }

  function trigger (...params: TParams) {
    for (const fn of fns) {
      fn(...params)
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
