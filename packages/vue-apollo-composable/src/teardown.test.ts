import type { TypedDocumentNode } from '@apollo/client'
import { ApolloClient, ApolloLink, gql, InMemoryCache, Observable } from '@apollo/client'
import { ref } from '@vue/reactivity'
import { defineComponent, h, nextTick } from '@vue/runtime-core'
import { mount } from '@vue/test-utils'
import { promiseTimeout } from '@vueuse/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as compat from './compat/index.ts'
import { DefaultApolloClient } from './useApolloClient.ts'
import { useQuery } from './useQuery.ts'

const QUERY = gql`
  query Hello($id: ID) {
    hello(id: $id)
  }
` as TypedDocumentNode<{ hello: string }, { id?: string }>

// The vitest config ignores unhandled errors, so collect them directly.
const unhandled: unknown[] = []
function onUnhandled(reason: unknown) {
  unhandled.push(reason)
}
beforeEach(() => {
  unhandled.length = 0
  process.on('unhandledRejection', onUnhandled)
})
afterEach(() => {
  process.off('unhandledRejection', onUnhandled)
})

// A link that never responds keeps every request in flight.
const pendingLink = new ApolloLink(() => new Observable(() => {}))

/** Mounts `setup` and runs the action it returns, then settles. */
async function runInComponent<T>(setup: () => () => T, link = pendingLink) {
  let act!: () => T
  const wrapper = mount(defineComponent({
    setup() {
      act = setup()
      return () => h('div')
    },
  }), {
    global: {
      provide: {
        [DefaultApolloClient]: new ApolloClient({ cache: new InMemoryCache(), link }),
      },
    },
  })
  await nextTick()
  const result = act()
  await nextTick()
  return { wrapper, result }
}

/** Runs the action, then unmounts with the request still in flight. */
async function unmountMidFlight<T>(setup: () => () => T): Promise<T> {
  const { wrapper, result } = await runInComponent(setup)
  wrapper.unmount()
  await promiseTimeout(20)
  return result
}

describe('teardown with a request in flight', () => {
  it('does not leak an AbortError from an unawaited refetch', async () => {
    await unmountMidFlight(() => {
      const { refetch } = useQuery(QUERY)
      return () => void refetch()
    })
    expect(unhandled).toEqual([])
  })

  it('still rejects an awaited refetch', async () => {
    // Wrapped so returning it from an async function does not await it.
    const { promise } = await unmountMidFlight(() => {
      const { refetch } = useQuery(QUERY)
      return () => ({ promise: refetch() })
    })
    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('does not leak an AbortError from an unawaited refetch when stopped', async () => {
    const { wrapper } = await runInComponent(() => {
      const { refetch, stop } = useQuery(QUERY)
      return () => {
        void refetch()
        stop()
      }
    })
    await promiseTimeout(20)
    expect(unhandled).toEqual([])
    wrapper.unmount()
    await promiseTimeout(20)
  })

  it('still reports a genuine failure of an unawaited refetch', async () => {
    let calls = 0
    // The initial request stays pending; the refetch fails.
    const link = new ApolloLink(() => new Observable((observer) => {
      if (calls++ > 0)
        observer.error(new Error('boom'))
    }))
    const { wrapper } = await runInComponent(() => {
      const { refetch } = useQuery(QUERY)
      return () => void refetch({ id: '2' })
    }, link)
    await promiseTimeout(20)
    expect(unhandled).toMatchObject([{ message: 'boom' }])
    wrapper.unmount()
    await promiseTimeout(20)
  })

  it('does not leak from a refetch superseded by a variable change', async () => {
    const id = ref('1')
    const { wrapper } = await runInComponent(() => {
      const { refetch } = useQuery(QUERY, () => ({ variables: { id: id.value } }))
      return () => {
        void refetch()
        id.value = '2'
      }
    })
    await promiseTimeout(20)
    expect(unhandled).toEqual([])
    wrapper.unmount()
    await promiseTimeout(20)
  })

  it('does not leak an AbortError from an unawaited fetchMore', async () => {
    await unmountMidFlight(() => {
      const { fetchMore } = useQuery(QUERY)
      return () => void fetchMore({ variables: { id: '2' } })
    })
    expect(unhandled).toEqual([])
  })

  it('does not leak an AbortError from compat useLazyQuery load and refetch', async () => {
    await unmountMidFlight(() => {
      const { load, refetch } = compat.useLazyQuery(QUERY)
      return () => {
        void load()
        void refetch()
      }
    })
    expect(unhandled).toEqual([])
  })

  it('does not leak an AbortError from an unawaited compat fetchMore', async () => {
    await unmountMidFlight(() => {
      const { fetchMore } = compat.useQuery<{ hello: string }, { id?: string }>(QUERY)
      return () => void fetchMore({ variables: { id: '2' } })
    })
    expect(unhandled).toEqual([])
  })
})
