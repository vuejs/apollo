import type { ErrorLike } from '@apollo/client'
import type { Component } from 'vue'
import { ObservableQuery } from '@apollo/client'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, shallowRef } from 'vue'
import ApolloQueryGeneric from './ApolloQuery.vue'
import ApolloSubscribeToMoreGeneric from './ApolloSubscribeToMore.vue'
import { createMockClient, mock, THING_ADDED, THINGS_QUERY } from './test-utils/client.ts'
import { provideClient, waitFor } from './test-utils/mount.ts'

const ApolloQuery = ApolloQueryGeneric as unknown as Component
const ApolloSubscribeToMore = ApolloSubscribeToMoreGeneric as unknown as Component

afterEach(() => {
  vi.restoreAllMocks()
})

/** Subscriber as default-slot content, with `variables` rebuilt on every render. */
function createParent(updateQuery = (previous: unknown) => previous) {
  return defineComponent({
    props: { tick: { type: Number, default: 0 } },
    setup(props) {
      return () =>
        h(ApolloQuery, { query: THINGS_QUERY, variables: { term: 'a' } }, {
          data: (slotProps: any) =>
            h('div', { class: 'data' }, `${slotProps.data.things.length}|${props.tick}`),
          default: () =>
            h(ApolloSubscribeToMore, {
              document: THING_ADDED,
              variables: { term: 'a' },
              updateQuery,
            }),
        })
    },
  })
}

describe('apolloSubscribeToMore', () => {
  it('mounts as default-slot content alongside a #data slot', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const wrapper = mount(createParent(), {
      global: provideClient(createMockClient([mock('a', ['a1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())

    // Opinionated mode must still render default-slot children, or nothing subscribes.
    expect(subscribeToMore).toHaveBeenCalledTimes(1)
    expect(subscribeToMore.mock.calls[0]![0]).toMatchObject({
      document: THING_ADDED,
      variables: { term: 'a' },
    })

    wrapper.unmount()
  })

  it('does not re-subscribe when the parent re-renders with equal variables', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const wrapper = mount(createParent(), {
      global: provideClient(createMockClient([mock('a', ['a1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(subscribeToMore).toHaveBeenCalledTimes(1)

    // Fresh `variables` identity each render; comparing by identity would re-subscribe.
    await wrapper.setProps({ tick: 1 })
    await wrapper.setProps({ tick: 2 })
    await waitFor(() => wrapper.find('.data').text().endsWith('|2'))

    expect(subscribeToMore).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('leaves the subscription open across equal re-renders', async () => {
    // Counting `subscribeToMore` calls is not enough: a cleanup that fires on every
    // watcher re-run tears the subscription down without the count ever changing.
    let unsubscribed = 0
    const original = ObservableQuery.prototype.subscribeToMore
    vi.spyOn(ObservableQuery.prototype, 'subscribeToMore').mockImplementation(
      function (this: ObservableQuery, options: Parameters<ObservableQuery['subscribeToMore']>[0]) {
        const off = original.call(this, options)
        return () => {
          unsubscribed++
          return off?.()
        }
      },
    )

    const wrapper = mount(createParent(), {
      global: provideClient(createMockClient([mock('a', ['a1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(unsubscribed).toBe(0)

    await wrapper.setProps({ tick: 1 })
    await wrapper.setProps({ tick: 2 })
    await waitFor(() => wrapper.find('.data').text().endsWith('|2'))

    expect(unsubscribed).toBe(0)

    wrapper.unmount()
    expect(unsubscribed).toBe(1)
  })

  it('re-subscribes when the variables actually change', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const Parent = defineComponent({
      props: { term: { type: String, default: 'a' } },
      setup(props) {
        return () =>
          h(ApolloQuery, { query: THINGS_QUERY, variables: { term: 'a' } }, {
            data: () => h('div', { class: 'data' }, 'data'),
            default: () =>
              h(ApolloSubscribeToMore, { document: THING_ADDED, variables: { term: props.term } }),
          })
      },
    })

    const wrapper = mount(Parent, { global: provideClient(createMockClient([mock('a', ['a1'])])) })

    await waitFor(() => wrapper.find('.data').exists())
    expect(subscribeToMore).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ term: 'b' })
    expect(subscribeToMore).toHaveBeenCalledTimes(2)
    expect(subscribeToMore.mock.calls[1]![0]).toMatchObject({ variables: { term: 'b' } })

    wrapper.unmount()
  })

  it('calls through to the latest updateQuery prop without re-subscribing', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const first = vi.fn((previous: unknown) => previous)
    const second = vi.fn((previous: unknown) => previous)
    const updateQuery = shallowRef(first)

    const Parent = defineComponent({
      setup: () => () =>
        h(ApolloQuery, { query: THINGS_QUERY, variables: { term: 'a' } }, {
          data: () => h('div', { class: 'data' }, 'data'),
          default: () =>
            h(ApolloSubscribeToMore, {
              document: THING_ADDED,
              variables: { term: 'a' },
              updateQuery: updateQuery.value,
            }),
        }),
    })

    const wrapper = mount(Parent, { global: provideClient(createMockClient([mock('a', ['a1'])])) })

    await waitFor(() => wrapper.find('.data').exists())

    updateQuery.value = second
    await wrapper.vm.$nextTick()

    const options = subscribeToMore.mock.calls[0]![0] as {
      updateQuery?: (previous: unknown, options: unknown) => unknown
    }
    options.updateQuery?.({ things: [] }, {})

    // The swap is picked up without tearing the subscription down.
    expect(second).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
    expect(subscribeToMore).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('emits error when the subscription fails', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const onError = vi.fn()
    const Parent = defineComponent({
      setup: () => () =>
        h(ApolloQuery, { query: THINGS_QUERY, variables: { term: 'a' } }, {
          data: () => h('div', { class: 'data' }, 'data'),
          default: () =>
            h(ApolloSubscribeToMore, { document: THING_ADDED, variables: { term: 'a' }, onError }),
        }),
    })

    const wrapper = mount(Parent, { global: provideClient(createMockClient([mock('a', ['a1'])])) })

    await waitFor(() => wrapper.find('.data').exists())

    const options = subscribeToMore.mock.calls[0]![0] as { onError?: (error: ErrorLike) => void }
    const failure = new Error('socket closed')
    options.onError?.(failure)
    await wrapper.vm.$nextTick()

    expect(onError).toHaveBeenCalledWith(failure)

    wrapper.unmount()
  })

  it('forwards the context prop', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const Parent = defineComponent({
      setup: () => () =>
        h(ApolloQuery, { query: THINGS_QUERY, variables: { term: 'a' } }, {
          data: () => h('div', { class: 'data' }, 'data'),
          default: () =>
            h(ApolloSubscribeToMore, {
              document: THING_ADDED,
              variables: { term: 'a' },
              context: { headers: { authorization: 'token' } },
            }),
        }),
    })

    const wrapper = mount(Parent, { global: provideClient(createMockClient([mock('a', ['a1'])])) })

    await waitFor(() => wrapper.find('.data').exists())
    expect(subscribeToMore.mock.calls[0]![0]).toMatchObject({
      context: { headers: { authorization: 'token' } },
    })

    wrapper.unmount()
  })

  /*
   * `useQuery` destroys and recreates its ObservableQuery on every enabled flip, taking its
   * subscriptions with it, so keying only on the document and variables never re-subscribes.
   */
  it('re-subscribes when the parent query is re-enabled', async () => {
    const subscribeToMore = vi.spyOn(ObservableQuery.prototype, 'subscribeToMore')
    const disabled = shallowRef(true)
    const Parent = defineComponent({
      setup: () => () =>
        h(ApolloQuery, { query: THINGS_QUERY, variables: { term: 'a' }, disabled: disabled.value }, {
          data: () => h('div', { class: 'data' }, 'data'),
          default: () =>
            h(ApolloSubscribeToMore, { document: THING_ADDED, variables: { term: 'a' } }),
        }),
    })

    const wrapper = mount(Parent, { global: provideClient(createMockClient([mock('a', ['a1'])])) })

    await wrapper.vm.$nextTick()
    expect(subscribeToMore).toHaveBeenCalledTimes(0)

    disabled.value = false
    await waitFor(() => wrapper.find('.data').exists())

    expect(subscribeToMore).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('renders a comment node and nothing else', async () => {
    const wrapper = mount(createParent(), {
      global: provideClient(createMockClient([mock('a', ['a1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())

    // An empty template renders no node at all, which breaks a keyed sibling list.
    expect(wrapper.findComponent(ApolloSubscribeToMore).element.nodeType).toBe(Node.COMMENT_NODE)

    wrapper.unmount()
  })

  it('throws when used outside an ApolloQuery', () => {
    expect(() =>
      mount(ApolloSubscribeToMore, {
        props: { document: THING_ADDED, variables: { term: 'a' } },
        global: provideClient(createMockClient([])),
      }),
    ).toThrow(/must be nested inside an <ApolloQuery>/)
  })
})
