import type { TypedDocumentNode } from '@apollo/client'
import type { EffectScope } from '@vue/reactivity'
import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { effectScope } from '@vue/reactivity'
import { nextTick } from '@vue/runtime-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { provideApolloClient } from './useApolloClient.ts'
import { useGlobalMutationLoading } from './useLoading.ts'
import { useMutation } from './useMutation.ts'

const ADD_THING = gql`
  mutation AddThing($id: String!) {
    addThing(id: $id) {
      id
    }
  }
` as TypedDocumentNode<{ addThing: { id: string } }, { id: string }>

/** Every call misses the mock, so `mutate()` always fails. */
function createFailingClient() {
  return new ApolloClient({
    link: new MockLink([], { showWarnings: false }),
    cache: new InMemoryCache(),
  })
}

const scopes: EffectScope[] = []

function runInScope<T>(fn: () => T): T {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(fn)!
}

afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  vi.restoreAllMocks()
})

describe('useMutation loading tracking', () => {
  it.each([
    { name: 'outside an effect scope', scoped: false },
    { name: 'inside an effect scope', scoped: true },
  ])('runs without warnings $name', async ({ scoped }) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const data = { addThing: { id: 'x' } }
    const client = new ApolloClient({
      link: new MockLink([{
        request: { query: ADD_THING, variables: { id: 'x' } },
        result: { data },
        delay: 0,
      }]),
      cache: new InMemoryCache(),
    })
    const createMutation = () => provideApolloClient(client)(() =>
      useMutation(ADD_THING, { variables: { id: 'x' } }),
    )
    const { mutate, loading, result } = scoped ? runInScope(createMutation) : createMutation()
    const globalLoading = useGlobalMutationLoading()

    expect(loading.value).toBe(false)
    expect(globalLoading.value).toBe(false)

    const pending = mutate()
    await nextTick()
    expect(loading.value).toBe(true)
    const globalLoadingWhilePending = globalLoading.value

    await expect(pending).resolves.toMatchObject({ data })
    expect(loading.value).toBe(false)
    expect(result.value).toEqual(data)
    expect(globalLoading.value).toBe(false)
    expect(warn).not.toHaveBeenCalled()
    expect(globalLoadingWhilePending).toBe(scoped)
    client.stop()
  })
})

describe('useMutation throws: auto', () => {
  it('rejects while nothing is listening for errors', async () => {
    const client = createFailingClient()
    const { mutate } = runInScope(() =>
      provideApolloClient(client)(() => useMutation(ADD_THING, { variables: { id: 'x' } })),
    )

    await expect(mutate()).rejects.toThrow()
  })

  it('resolves once an error listener is registered', async () => {
    const client = createFailingClient()
    const { mutate, onError } = runInScope(() =>
      provideApolloClient(client)(() => useMutation(ADD_THING, { variables: { id: 'x' } })),
    )
    onError(() => {})

    await expect(mutate()).resolves.toMatchObject({ data: undefined })
  })

  it('rejects again after `off()` removes the listener', async () => {
    const client = createFailingClient()
    const { mutate, onError } = runInScope(() =>
      provideApolloClient(client)(() => useMutation(ADD_THING, { variables: { id: 'x' } })),
    )
    const { off } = onError(() => {})

    await expect(mutate()).resolves.toMatchObject({ data: undefined })

    off()
    await expect(mutate()).rejects.toThrow()
  })

  /*
   * The event hook drops the handler when the registering scope dies. The listener count
   * behind `throws: 'auto'` has to follow, or the mutation keeps resolving for a listener
   * that is gone.
   */
  it('rejects again after the registering scope is disposed', async () => {
    const client = createFailingClient()
    const { mutate, onError } = runInScope(() =>
      provideApolloClient(client)(() => useMutation(ADD_THING, { variables: { id: 'x' } })),
    )

    const listener = effectScope()
    listener.run(() => onError(() => {}))

    await expect(mutate()).resolves.toMatchObject({ data: undefined })

    listener.stop()
    await expect(mutate()).rejects.toThrow()
  })

  it('counts each listener, so one leaving does not disarm the rest', async () => {
    const client = createFailingClient()
    const { mutate, onError } = runInScope(() =>
      provideApolloClient(client)(() => useMutation(ADD_THING, { variables: { id: 'x' } })),
    )
    const first = onError(() => {})
    onError(() => {})

    first.off()
    // Calling the same `off` twice must not decrement past the remaining listener.
    first.off()

    await expect(mutate()).resolves.toMatchObject({ data: undefined })
  })
})
