import type { TypedDocumentNode } from '@apollo/client'
import type { EffectScope } from '@vue/reactivity'
import { ApolloClient, ApolloLink, gql, InMemoryCache, NetworkStatus } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { effectScope, ref } from '@vue/reactivity'
import { nextTick, watch } from '@vue/runtime-core'
import { promiseTimeout, until } from '@vueuse/core'
import { afterEach, assertType, describe, expect, it, vi } from 'vitest'
import { provideApolloClient } from './useApolloClient.ts'
import { useGlobalQueryLoading } from './useLoading.ts'
import { useQuery } from './useQuery.ts'

// #region Query
interface Thing { __typename: 'Thing', id: string }
interface ThingsData { things: Thing[] }
interface ThingsVars { term: string }

const THINGS_QUERY = gql`
  query Things($term: String!) {
    things(term: $term) {
      id
    }
  }
` as TypedDocumentNode<ThingsData, ThingsVars>
// #endregion

// #region Test harness
const REQUEST_DELAY = 30

function mock(term: string, ids: string[], options: { delay?: number, error?: Error } = {}) {
  return {
    request: { query: THINGS_QUERY, variables: { term } },
    maxUsageCount: Number.POSITIVE_INFINITY,
    delay: options.delay ?? REQUEST_DELAY,
    ...(options.error
      ? { error: options.error }
      : { result: { data: { things: ids.map(id => ({ __typename: 'Thing', id })) } } }),
  }
}

/** Apollo client backed by MockLink, with a counter for requests that reach the link. */
function createMockClient(mocks: ReturnType<typeof mock>[]) {
  const requests: string[] = []
  const countLink = new ApolloLink((operation, forward) => {
    requests.push(operation.variables.term as string)
    return forward(operation)
  })

  const client = new ApolloClient({
    link: ApolloLink.from([countLink, new MockLink(mocks, { showWarnings: false })]),
    cache: new InMemoryCache(),
  })

  return { client, requests }
}

/** Flat snapshot of `current`, recorded on every state transition. */
interface Snapshot {
  resultState: string
  ids: string[] | undefined
  loading: boolean
  pending: boolean
  isPreviousResult: boolean
  networkStatus: NetworkStatus
  partial: boolean
  error: string | undefined
}

const scopes: EffectScope[] = []

/**
 * `provideApolloClient()` is declared as returning `(fn) => any`, which would erase the
 * query's types and silently defeat the narrowing assertions below. Annotate to keep them.
 */
type ThingsQuery = ReturnType<typeof useQuery<ThingsData, ThingsVars>>

function createQuery(
  client: ApolloClient,
  options: () => useQuery.Options<ThingsData, ThingsVars>,
) {
  const scope = effectScope()
  scopes.push(scope)

  return scope.run(() => {
    const query: ThingsQuery = provideApolloClient(client)(() => useQuery(THINGS_QUERY, options))

    const transitions: Snapshot[] = []
    watch(query.current, () => transitions.push(snapshot(query)), { flush: 'sync' })

    return { query, transitions, globalLoading: useGlobalQueryLoading() }
  })!
}

function snapshot(query: ThingsQuery): Snapshot {
  const state = query.current.value
  return {
    resultState: state.resultState,
    ids: state.result?.things.map(thing => thing.id),
    loading: state.loading,
    pending: state.pending,
    isPreviousResult: state.isPreviousResult,
    networkStatus: state.networkStatus,
    partial: state.partial,
    error: state.error?.message,
  }
}

function ids(query: ThingsQuery) {
  return query.current.value.result?.things.map(thing => thing.id)
}

function waitUntil(condition: () => boolean, timeout = 2000) {
  return until(condition).toBe(true, { timeout, throwOnTimeout: true })
}

/** Resolves once the query has settled on a fresh (non-retained) complete result. */
function waitForFresh(query: ThingsQuery) {
  return waitUntil(() => query.current.value.resultState === 'complete'
    && !query.current.value.isPreviousResult
    && !query.current.value.loading)
}

afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
})
// #endregion

// #region Retention
describe('useQuery keepPreviousResult', () => {
  it('reports a coherent state while the previous result is retained', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await waitForFresh(query)
    expect(ids(query)).toEqual(['a1'])

    term.value = 'b'
    await nextTick()

    // The retained rows are still there, and `resultState` says so.
    expect(ids(query)).toEqual(['a1'])
    expect(query.current.value.resultState).toBe('complete')
    expect(query.current.value.isPreviousResult).toBe(true)
    expect(query.current.value.loading).toBe(true)

    await waitForFresh(query)
    expect(ids(query)).toEqual(['b1'])
    expect(query.current.value.isPreviousResult).toBe(false)
  })

  it('narrowing on resultState === "complete" keeps the retained result', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await waitForFresh(query)
    term.value = 'b'
    await nextTick()

    // The guard the union steers users toward must not discard the retained result.
    const state = query.current.value
    const rendered = state.resultState === 'complete' ? state.result.things.map(thing => thing.id) : null
    expect(rendered).toEqual(['a1'])
  })

  it('moves result, resultState and partial together', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await waitForFresh(query)
    const before = {
      result: query.current.value.result,
      resultState: query.current.value.resultState,
      partial: query.current.value.partial,
    }

    term.value = 'b'
    await nextTick()

    // The result-describing fields are retained as one unit.
    expect({
      result: query.current.value.result,
      resultState: query.current.value.resultState,
      partial: query.current.value.partial,
    }).toEqual(before)
  })

  it('is false on the initial load, when there is nothing to retain', async () => {
    const { client } = createMockClient([mock('a', ['a1'])])
    const { query, transitions } = createQuery(client, () => ({
      variables: { term: 'a' },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await waitForFresh(query)
    expect(transitions.every(t => t.isPreviousResult === false)).toBe(true)
  })

  it('does not retain when keepPreviousResult is not set', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
    }))

    await waitForFresh(query)
    term.value = 'b'
    await nextTick()

    expect(query.current.value.resultState).toBe('empty')
    expect(query.current.value.result).toBeUndefined()
    expect(query.current.value.isPreviousResult).toBe(false)
  })

  it('retains the previous result when the new request fails, and surfaces the error', async () => {
    const { client } = createMockClient([
      mock('a', ['a1']),
      mock('b', [], { error: new Error('boom') }),
    ])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await waitForFresh(query)
    term.value = 'b'

    await waitUntil(() => query.current.value.error != null)

    expect(query.current.value.error?.message).toContain('boom')
    expect(ids(query)).toEqual(['a1'])
    expect(query.current.value.resultState).toBe('complete')
    expect(query.current.value.isPreviousResult).toBe(true)
  })

  it('retains the previous result across enabled: false -> true', async () => {
    const { client } = createMockClient([mock('a', ['a1'])])
    const enabled = ref(true)
    const { query } = createQuery(client, () => ({
      variables: { term: 'a' },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
      enabled: enabled.value,
    }))

    await waitForFresh(query)
    expect(ids(query)).toEqual(['a1'])

    enabled.value = false
    await nextTick()
    expect(ids(query)).toEqual(['a1'])

    enabled.value = true
    await nextTick()

    expect(ids(query)).toEqual(['a1'])
    expect(query.current.value.resultState).toBe('complete')
    expect(query.current.value.isPreviousResult).toBe(true)
  })

  it('does not fire result events for a retained state', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    const onResult = vi.fn()
    const onCompleteResult = vi.fn()
    query.onResult(onResult)
    query.onCompleteResult(onCompleteResult)

    await waitForFresh(query)
    expect(onCompleteResult).toHaveBeenCalledTimes(1)

    term.value = 'b'
    await nextTick()

    // No new result arrived - only a retained one.
    expect(onResult).toHaveBeenCalledTimes(1)
    expect(onCompleteResult).toHaveBeenCalledTimes(1)

    await waitForFresh(query)
    expect(onCompleteResult).toHaveBeenCalledTimes(2)
  })

  it('exposes isPreviousResult as a top-level ref that agrees with current', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query, transitions } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await waitForFresh(query)
    term.value = 'b'
    await nextTick()
    expect(query.isPreviousResult.value).toBe(true)

    await waitForFresh(query)
    expect(query.isPreviousResult.value).toBe(false)
    expect(transitions.some(t => t.isPreviousResult)).toBe(true)
  })
})
// #endregion

// #region Pending
describe('useQuery pending state', () => {
  it('reports pending and loading throughout the debounce window', async () => {
    const { client, requests } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
      debounce: 80,
    }))

    await waitForFresh(query)
    expect(requests).toEqual(['a'])

    term.value = 'b'
    await nextTick()

    // The user has typed and a fetch is committed, but nothing is on the wire yet.
    expect(query.current.value.pending).toBe(true)
    expect(query.current.value.loading).toBe(true)
    expect(query.current.value.networkStatus).toBe(NetworkStatus.ready)
    expect(requests).toEqual(['a'])
    expect(ids(query)).toEqual(['a1'])

    await waitForFresh(query)
    expect(query.current.value.pending).toBe(false)
    expect(requests).toEqual(['a', 'b'])
    expect(ids(query)).toEqual(['b1'])
  })

  it('never drops loading between a variables change and the new result', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query, transitions } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
      debounce: 80,
    }))

    await waitForFresh(query)
    transitions.length = 0

    term.value = 'b'
    await waitForFresh(query)

    // Every transition except the final one is part of the busy window.
    const busyWindow = transitions.slice(0, -1)
    expect(busyWindow.length).toBeGreaterThan(0)
    expect(busyWindow.every(t => t.loading)).toBe(true)
    expect(transitions.at(-1)?.loading).toBe(false)
  })

  it('keeps the loading ref and current.loading in agreement', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      debounce: 80,
    }))

    const disagreements: string[] = []
    watch(
      () => [query.loading.value, query.current.value.loading, query.pending.value, query.current.value.pending] as const,
      ([loadingRef, currentLoading, pendingRef, currentPending]) => {
        if (loadingRef !== currentLoading || pendingRef !== currentPending) {
          disagreements.push(`loading ${loadingRef}/${currentLoading} pending ${pendingRef}/${currentPending}`)
        }
      },
      { flush: 'sync', immediate: true },
    )

    await waitForFresh(query)
    term.value = 'b'
    await waitForFresh(query)

    expect(disagreements).toEqual([])
  })

  it('never reports pending without debounce or throttle', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query, transitions } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
    }))

    await waitForFresh(query)
    term.value = 'b'
    await waitForFresh(query)

    expect(transitions.every(t => t.pending === false)).toBe(true)
  })

  it('does not report pending for a deeply-equal variables rebuild', async () => {
    const { client, requests } = createMockClient([mock('a', ['a1'])])
    const term = ref('a')
    const { query, transitions } = createQuery(client, () => ({
      variables: { term: term.value.trim() },
      fetchPolicy: 'no-cache',
      debounce: 80,
    }))

    await waitForFresh(query)
    transitions.length = 0

    // Deeply-equal rebuild: no fetch will follow, so there is nothing to be pending for.
    term.value = 'a '
    await nextTick()
    expect(query.current.value.pending).toBe(false)
    expect(query.current.value.loading).toBe(false)

    await promiseTimeout(150)
    expect(requests).toEqual(['a'])
    expect(transitions.every(t => t.pending === false)).toBe(true)
  })

  it('does not issue a request for variables abandoned inside the debounce window', async () => {
    const { client, requests } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
      debounce: 80,
    }))

    await waitForFresh(query)

    term.value = 'b'
    await nextTick()
    expect(query.current.value.pending).toBe(true)

    term.value = 'a'
    await nextTick()
    expect(query.current.value.pending).toBe(false)
    expect(query.current.value.loading).toBe(false)

    await promiseTimeout(200)
    expect(requests).toEqual(['a'])
    expect(ids(query)).toEqual(['a1'])
  })

  it('commits immediately on the throttle leading edge, and reports pending on the trailing one', async () => {
    const { client, requests } = createMockClient([
      mock('a', ['a1']),
      mock('b', ['b1']),
      mock('c', ['c1']),
    ])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
      throttle: 120,
    }))

    await waitForFresh(query)

    // Leading edge: committed straight away, so there is no pending window.
    term.value = 'b'
    await nextTick()
    expect(query.current.value.pending).toBe(false)
    expect(query.current.value.loading).toBe(true)

    // Inside the throttle window: committed only on the trailing edge.
    term.value = 'c'
    await nextTick()
    expect(query.current.value.pending).toBe(true)
    expect(query.current.value.loading).toBe(true)

    await waitForFresh(query)
    expect(requests).toEqual(['a', 'b', 'c'])
    expect(ids(query)).toEqual(['c1'])
  })

  it('counts the debounce window as loading in the global loading tracker', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query, globalLoading } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      debounce: 80,
    }))

    await waitForFresh(query)
    await waitUntil(() => globalLoading.value === false)

    term.value = 'b'
    await nextTick()
    expect(globalLoading.value).toBe(true)

    await waitForFresh(query)
    await waitUntil(() => globalLoading.value === false)
  })
})
// #endregion

// #region Awaiting
describe('useQuery awaiting with a retained result', () => {
  it('does not resolve against a retained result', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await query
    expect(ids(query)).toEqual(['a1'])

    term.value = 'b'
    await nextTick()
    expect(query.current.value.isPreviousResult).toBe(true)

    // `await` must wait for the data it was asked for, not the rows left on screen.
    await query
    expect(query.current.value.isPreviousResult).toBe(false)
    expect(ids(query)).toEqual(['b1'])
  })

  it('rejects when the request replacing a retained result fails', async () => {
    const { client } = createMockClient([
      mock('a', ['a1']),
      mock('b', [], { error: new Error('boom') }),
    ])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    await query
    term.value = 'b'

    // The retained result never becomes fresh, so awaiting has to settle on the error.
    const outcome = await Promise.race([
      (async () => {
        try {
          await query
          return 'resolved'
        }
        catch (error) {
          return (error as Error).message
        }
      })(),
      promiseTimeout(1000).then(() => 'HUNG'),
    ])

    expect(outcome).toContain('boom')
  })
})
// #endregion

// #region Variable commits
describe('useQuery variable commits', () => {
  it('issues one request per settled variables change', async () => {
    const { client, requests } = createMockClient([
      mock('a1', ['first']),
      mock('b1', ['intermediate']),
      mock('b2', ['final']),
    ])
    const filter = ref('a')
    const page = ref(1)
    const { query } = createQuery(client, () => ({
      variables: { term: `${filter.value}${page.value}` },
      fetchPolicy: 'no-cache',
    }))

    await waitForFresh(query)
    expect(requests).toEqual(['a1'])

    // Two writes in one tick are one intended change; the intermediate must not be sent.
    filter.value = 'b'
    page.value = 2

    await waitForFresh(query)
    expect(requests).toEqual(['a1', 'b2'])
    expect(ids(query)).toEqual(['final'])
  })

  it('does not emit consecutive identical states from onNextState', async () => {
    const { client } = createMockClient([mock('a', ['a1']), mock('b', ['b1'])])
    const term = ref('a')
    const { query } = createQuery(client, () => ({
      variables: { term: term.value },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    const emitted: string[] = []
    query.onNextState((state) => {
      emitted.push([
        state.resultState,
        state.result?.things.map(thing => thing.id).join(','),
        state.loading,
        state.pending,
        state.isPreviousResult,
        state.networkStatus,
      ].join('|'))
    })

    await waitForFresh(query)
    term.value = 'b'
    await waitForFresh(query)

    const duplicates = emitted.filter((entry, index) => index > 0 && entry === emitted[index - 1])
    expect(duplicates).toEqual([])
  })
})
// #endregion

// #region Cache hits
describe('useQuery with a result already in the cache', () => {
  /*
   * The cached result is applied while `useQuery()` is still running, so it reaches the
   * event hooks before the caller has had a chance to register any.
   */
  it('delivers the cached result to handlers registered after the call', async () => {
    const { client } = createMockClient([mock('a', ['a1'])])

    const warm = createQuery(client, () => ({ variables: { term: 'a' } }))!
    await until(() => warm.query.current.value.resultState).toBe('complete')

    const { query } = createQuery(client, () => ({
      variables: { term: 'a' },
      fetchPolicy: 'cache-only',
    }))!

    const onResult = vi.fn()
    const onCompleteResult = vi.fn()
    const onNextState = vi.fn()
    query.onResult(onResult)
    query.onCompleteResult(onCompleteResult)
    query.onNextState(onNextState)

    expect(query.current.value.resultState).toBe('complete')

    await nextTick()

    expect(onResult).toHaveBeenCalledTimes(1)
    expect(onCompleteResult).toHaveBeenCalledTimes(1)
    expect(onNextState).toHaveBeenCalledTimes(1)
  })

  it('does not replay when the result arrives from the link', async () => {
    const { client } = createMockClient([mock('a', ['a1'])])
    const { query } = createQuery(client, () => ({ variables: { term: 'a' } }))!

    const onResult = vi.fn()
    query.onResult(onResult)

    await until(() => query.current.value.resultState).toBe('complete')
    await promiseTimeout(REQUEST_DELAY)

    expect(onResult).toHaveBeenCalledTimes(1)
  })
})
// #endregion

// #region Types
describe('useQuery state types', () => {
  it('types the new state fields', () => {
    const { client } = createMockClient([mock('a', ['a1'])])
    const { query } = createQuery(client, () => ({
      variables: { term: 'a' },
      fetchPolicy: 'no-cache',
      keepPreviousResult: true,
    }))

    assertType<boolean>(query.current.value.pending)
    assertType<boolean>(query.current.value.isPreviousResult)
    assertType<boolean>(query.current.value.loading)
    assertType<boolean>(query.pending.value)
    assertType<boolean>(query.isPreviousResult.value)

    const state = query.current.value
    if (state.resultState === 'complete') {
      assertType<ThingsData>(state.result)
    }

    expect(true).toBe(true)
  })
})
// #endregion
