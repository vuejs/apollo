import type { ObservableQuery } from '@apollo/client'

const stoppedQueries = new WeakSet<ObservableQuery<any, any>>()

export function stopQuery(query: ObservableQuery<any, any>) {
  stoppedQueries.add(query)
  query.stop()
}

export function ignoreTeardownAbort<T>(promise: Promise<T>, query: ObservableQuery<any, any> | undefined): Promise<T> {
  const guarded: Promise<T> = promise.then(undefined, (error) => {
    if (query && stoppedQueries.has(query) && error?.name === 'AbortError') {
      // Attached before the rejection settles, so it never counts as unhandled.
      guarded.catch(() => {})
    }
    throw error
  })
  return guarded
}
