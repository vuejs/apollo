import type { Component } from 'vue'
import type { ThingsData } from './test-utils/client.ts'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import ApolloQueryGeneric from './ApolloQuery.vue'
import { captureWatchQuery, createMockClient, mock, THINGS_QUERY } from './test-utils/client.ts'
import { provideClient, provideClients, waitFor } from './test-utils/mount.ts'

// `mount()` cannot infer generic components; slot typing is covered by type-tests/.
const ApolloQuery = ApolloQueryGeneric as unknown as Component

function ids(data: ThingsData) {
  return data.things.map(thing => thing.id).join(',')
}

function mountQuery(
  client: ReturnType<typeof createMockClient>,
  slots: Record<string, (props?: any) => any>,
  props: Record<string, unknown> = {},
) {
  return mount(ApolloQuery, {
    props: { query: THINGS_QUERY, variables: { term: 'a' }, ...props },
    slots,
    global: provideClient(client),
  })
}

function dataSlot(props: any) {
  return h('div', { class: 'data' }, `${ids(props.data)}|${props.isPreviousResult}`)
}

const loadingSlot = () => h('div', { class: 'loading' }, 'loading')

describe('apolloQuery opinionated mode', () => {
  it('renders #loading, then #data', async () => {
    const wrapper = mountQuery(createMockClient([mock('a', ['a1'])]), {
      loading: loadingSlot,
      data: dataSlot,
    })

    expect(wrapper.find('.loading').exists()).toBe(true)

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('a1|false')

    wrapper.unmount()
  })

  it('clears the result on a variables change, with no `keep-previous-result` prop', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' } },
      slots: { loading: loadingSlot, data: dataSlot },
      global: provideClient(createMockClient([mock('a', ['a1']), mock('b', ['b1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())

    await wrapper.setProps({ variables: { term: 'b' } })

    // Providing #data must not opt into retention on the user's behalf.
    expect(wrapper.find('.data').exists()).toBe(false)
    expect(wrapper.find('.loading').exists()).toBe(true)

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('b1|false')

    wrapper.unmount()
  })

  it('keeps the previous result when `keep-previous-result` is set', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, keepPreviousResult: true },
      slots: { loading: loadingSlot, data: dataSlot },
      global: provideClient(createMockClient([mock('a', ['a1']), mock('b', ['b1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('a1|false')

    await wrapper.setProps({ variables: { term: 'b' } })

    // Retained rows stay on screen, flagged as previous, so no skeleton flash.
    expect(wrapper.find('.loading').exists()).toBe(false)
    expect(wrapper.find('.data').text()).toBe('a1|true')

    await waitFor(() => wrapper.find('.data').text() === 'b1|false')

    wrapper.unmount()
  })

  // A failed refetch leaves the rows on screen, so `#error` never runs and the failure
  // would be invisible inside the slot without its own `error` prop.
  it('passes the error to #data when a refetch fails over existing rows', async () => {
    const client = createMockClient([
      { ...mock('a', ['a1']), maxUsageCount: 1 },
      { ...mock('a', [], { error: new Error('boom') }), maxUsageCount: 1 },
    ])

    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' } },
      slots: {
        loading: loadingSlot,
        error: () => h('div', { class: 'error-slot' }, 'error slot'),
        data: (props: any) =>
          h('div', { class: 'data' }, `${ids(props.data)}|${props.error?.message ?? '-'}`),
      },
      global: provideClient(client),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('a1|-')

    const apollo = wrapper.vm as unknown as { refetch: () => Promise<unknown> }
    await apollo.refetch().catch(() => {})
    await waitFor(() => wrapper.find('.data').text() !== 'a1|-')

    expect(wrapper.find('.error-slot').exists()).toBe(false)
    expect(wrapper.find('.data').text()).toBe('a1|boom')

    wrapper.unmount()
  })

  it('renders #empty when the predicate matches', async () => {
    const wrapper = mountQuery(
      createMockClient([mock('a', [])]),
      { loading: loadingSlot, empty: () => h('div', { class: 'empty' }, 'empty'), data: dataSlot },
      { empty: (data: ThingsData) => data.things.length === 0 },
    )

    await waitFor(() => wrapper.find('.empty').exists())
    expect(wrapper.find('.data').exists()).toBe(false)

    wrapper.unmount()
  })

  it('renders #error when the query fails with nothing to show', async () => {
    const wrapper = mountQuery(
      createMockClient([mock('a', [], { error: new Error('boom') })]),
      {
        loading: loadingSlot,
        error: (props: any) => h('div', { class: 'error' }, props.error.message),
        data: dataSlot,
      },
    )

    await waitFor(() => wrapper.find('.error').exists())
    expect(wrapper.find('.error').text()).toContain('boom')

    wrapper.unmount()
  })
})

describe('apolloQuery raw mode', () => {
  it('passes flattened state to #default and does not retain by default', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' } },
      slots: {
        default: (props: any) =>
          h('div', { class: 'raw' }, `${props.resultState}|${props.loading}|${typeof props.refetch}`),
      },
      global: provideClient(createMockClient([mock('a', ['a1']), mock('b', ['b1'])])),
    })

    expect(wrapper.find('.raw').text()).toBe('empty|true|function')

    await waitFor(() => wrapper.find('.raw').text() === 'complete|false|function')

    await wrapper.setProps({ variables: { term: 'b' } })
    expect(wrapper.find('.raw').text()).toBe('empty|true|function')

    wrapper.unmount()
  })
})

describe('apolloQuery events', () => {
  it('emits result, complete-result and next-state', async () => {
    const wrapper = mountQuery(createMockClient([mock('a', ['a1'])]), { data: dataSlot })

    await waitFor(() => wrapper.find('.data').exists())

    const result = wrapper.emitted('result')
    expect(result).toHaveLength(1)
    expect(ids((result as unknown[][])[0]![0] as ThingsData)).toBe('a1')
    expect(wrapper.emitted('completeResult')).toHaveLength(1)
    expect(wrapper.emitted('nextState')?.length ?? 0).toBeGreaterThan(0)

    wrapper.unmount()
  })

  it('emits error', async () => {
    const wrapper = mountQuery(
      createMockClient([mock('a', [], { error: new Error('boom') })]),
      { data: dataSlot, error: () => h('div', { class: 'error' }, 'error') },
    )

    await waitFor(() => wrapper.find('.error').exists())
    expect(wrapper.emitted('error')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('apolloQuery disabled', () => {
  it('runs by default, with no `disabled` prop given', async () => {
    const client = createMockClient([mock('a', ['a1'])])
    const calls = captureWatchQuery(client)
    const wrapper = mountQuery(client, { data: dataSlot })

    await waitFor(() => wrapper.find('.data').exists())
    expect(calls).toHaveLength(1)

    wrapper.unmount()
  })

  it('does not execute while disabled, then runs once re-enabled', async () => {
    const client = createMockClient([mock('a', ['a1'])])
    const calls = captureWatchQuery(client)
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, disabled: true },
      slots: { data: dataSlot, loading: loadingSlot },
      global: provideClient(client),
    })

    await new Promise(resolve => setTimeout(resolve, 40))
    expect(calls).toHaveLength(0)
    expect(wrapper.find('.data').exists()).toBe(false)

    await wrapper.setProps({ disabled: false })
    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('a1|false')

    wrapper.unmount()
  })

  it('leaves `options.enabled` alone when `disabled` is not set', () => {
    const client = createMockClient([mock('a', ['a1'])])
    const calls = captureWatchQuery(client)
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, options: { enabled: false } },
      slots: { data: dataSlot },
      global: provideClient(client),
    })

    expect(calls).toHaveLength(0)

    wrapper.unmount()
  })
})

describe('apolloQuery options passthrough', () => {
  it('applies `options` entries that have no dedicated prop', () => {
    const client = createMockClient([mock('a', ['a1'])])
    const calls = captureWatchQuery(client)

    const wrapper = mount(ApolloQuery, {
      props: {
        query: THINGS_QUERY,
        variables: { term: 'a' },
        options: { errorPolicy: 'all' },
      },
      slots: { data: dataSlot },
      global: provideClient(client),
    })

    expect(calls[0]).toMatchObject({ errorPolicy: 'all' })

    wrapper.unmount()
  })

  it('does not let an absent prop overwrite the same key in `options`', () => {
    const client = createMockClient([mock('a', ['a1'])])
    const calls = captureWatchQuery(client)

    const wrapper = mount(ApolloQuery, {
      props: {
        query: THINGS_QUERY,
        variables: { term: 'a' },
        // Each of these also exists as a dedicated prop, left unset here.
        options: { fetchPolicy: 'no-cache', pollInterval: 1234 },
      },
      slots: { data: dataSlot },
      global: provideClient(client),
    })

    expect(calls[0]).toMatchObject({ fetchPolicy: 'no-cache', pollInterval: 1234 })

    wrapper.unmount()
  })

  it('does not let an absent boolean prop overwrite the same key in `options`', async () => {
    const wrapper = mount(ApolloQuery, {
      props: {
        query: THINGS_QUERY,
        variables: { term: 'a' },
        // Absent boolean props are cast to `false` unless the component declares a default.
        options: { keepPreviousResult: true },
      },
      slots: { loading: loadingSlot, data: dataSlot },
      global: provideClient(createMockClient([mock('a', ['a1']), mock('b', ['b1'])])),
    })

    await waitFor(() => wrapper.find('.data').exists())
    await wrapper.setProps({ variables: { term: 'b' } })

    expect(wrapper.find('.data').text()).toBe('a1|true')

    wrapper.unmount()
  })

  it('lets a dedicated prop win over `options`', () => {
    const client = createMockClient([mock('a', ['a1'])])
    const calls = captureWatchQuery(client)

    const wrapper = mount(ApolloQuery, {
      props: {
        query: THINGS_QUERY,
        variables: { term: 'a' },
        fetchPolicy: 'cache-only',
        options: { fetchPolicy: 'no-cache' },
      },
      slots: { data: dataSlot },
      global: provideClient(client),
    })

    expect(calls[0]).toMatchObject({ fetchPolicy: 'cache-only' })

    wrapper.unmount()
  })
})

describe('apolloQuery empty predicate', () => {
  it('ignores #empty when no `empty` prop is given, so #data owns the empty case', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' } },
      slots: { data: dataSlot, empty: () => h('div', { class: 'empty' }, 'empty') },
      global: provideClient(createMockClient([mock('a', [])])),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.empty').exists()).toBe(false)

    wrapper.unmount()
  })

  it('falls back to #data when `empty` is given without an #empty slot', async () => {
    const wrapper = mount(ApolloQuery, {
      props: {
        query: THINGS_QUERY,
        variables: { term: 'a' },
        empty: (data: ThingsData) => data.things.length === 0,
      },
      slots: { data: dataSlot },
      global: provideClient(createMockClient([mock('a', [])])),
    })

    // Without the fallback this renders nothing at all.
    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('|false')

    wrapper.unmount()
  })

  it('renders #empty when the query settles with nothing to show', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, fetchPolicy: 'cache-only' },
      slots: {
        data: dataSlot,
        loading: loadingSlot,
        error: () => h('div', { class: 'error' }, 'error'),
        empty: () => h('div', { class: 'empty' }, 'empty'),
      },
      global: provideClient(createMockClient([])),
    })

    // A cold `cache-only` query is not loading, has no error and has no result.
    await waitFor(() => wrapper.find('.empty').exists())

    wrapper.unmount()
  })

  it('renders nothing at all while disabled, even with an #empty slot', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, disabled: true },
      slots: { data: dataSlot, loading: loadingSlot, empty: () => h('div', { class: 'empty' }, 'empty') },
      global: provideClient(createMockClient([mock('a', ['a1'])])),
    })

    await new Promise(resolve => setTimeout(resolve, 40))
    expect(wrapper.text()).toBe('')

    wrapper.unmount()
  })
})

describe('apolloQuery cache hits', () => {
  /** `useQuery` applies a cached result during setup, before the event bridges exist. */
  it('emits for a result that was already in the cache', async () => {
    const client = createMockClient([mock('a', ['a1'])])
    const warm = mountQuery(client, { data: dataSlot })
    await waitFor(() => warm.find('.data').exists())
    warm.unmount()

    const wrapper = mountQuery(client, { data: dataSlot }, { fetchPolicy: 'cache-only' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.data').text()).toBe('a1|false')
    expect(wrapper.emitted('result')).toHaveLength(1)
    expect(wrapper.emitted('completeResult')).toHaveLength(1)
    expect(wrapper.emitted('nextState')).toHaveLength(1)

    wrapper.unmount()
  })

  it('emits exactly once when the result arrives from the network', async () => {
    const wrapper = mountQuery(createMockClient([mock('a', ['a1'])]), { data: dataSlot })

    await waitFor(() => wrapper.find('.data').exists())

    expect(wrapper.emitted('result')).toHaveLength(1)
    expect(wrapper.emitted('completeResult')).toHaveLength(1)

    wrapper.unmount()
  })
})

describe('apolloQuery exposed instance', () => {
  // `useQuery` returns a `PromiseLike`; leaving `then` on the instance would make
  // `await apolloRef.value` resolve to something other than the component.
  it('is not a thenable', async () => {
    let instance: any
    const wrapper = mount({
      setup: () => () => h(
        ApolloQuery,
        { query: THINGS_QUERY, variables: { term: 'a' }, ref: (value: any) => { instance = value } },
        { data: dataSlot },
      ),
    }, { global: provideClient(createMockClient([mock('a', ['a1'])])) })

    await wrapper.vm.$nextTick()
    expect(instance.then).toBeUndefined()

    wrapper.unmount()
  })
})

describe('apolloQuery variable timing', () => {
  /** `.text()` throws on a missing element, and both slots blank out mid-transition. */
  function dataText(wrapper: ReturnType<typeof mount>) {
    const found = wrapper.find('.data')
    return found.exists() ? found.text() : ''
  }

  it('delays a variables change by `debounce`, covering the window with `loading`', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, debounce: 150 },
      slots: {
        data: (props: any) => h('div', { class: 'data' }, `${ids(props.data)}|${props.loading}|${props.pending}`),
      },
      global: provideClient(createMockClient([mock('a', ['a1']), mock('b', ['b1'])])),
    })

    await waitFor(() => dataText(wrapper) === 'a1|false|false')

    await wrapper.setProps({ variables: { term: 'b' } })
    await new Promise(resolve => setTimeout(resolve, 40))

    // Still the old rows, and the wait is reported rather than hidden.
    expect(dataText(wrapper)).toBe('a1|true|true')

    await waitFor(() => dataText(wrapper) === 'b1|false|false')

    wrapper.unmount()
  })

  it('coalesces rapid variable changes under `throttle`', async () => {
    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, throttle: 150 },
      slots: { data: dataSlot },
      global: provideClient(createMockClient([mock('a', ['a1']), mock('b', ['b1']), mock('c', ['c1'])])),
    })

    await waitFor(() => dataText(wrapper) === 'a1|false')

    await wrapper.setProps({ variables: { term: 'b' } })
    await wrapper.setProps({ variables: { term: 'c' } })
    await new Promise(resolve => setTimeout(resolve, 40))

    // The trailing value waits out the window rather than firing a third request.
    expect(dataText(wrapper)).not.toBe('c1|false')

    await waitFor(() => dataText(wrapper) === 'c1|false')

    wrapper.unmount()
  })
})

describe('apolloQuery clientId', () => {
  it('resolves against the provided ApolloClients map', async () => {
    const analytics = createMockClient([mock('a', ['a1'])])
    const fallback = createMockClient([mock('a', ['nope'])])
    const analyticsCalls = captureWatchQuery(analytics)
    const fallbackCalls = captureWatchQuery(fallback)

    const wrapper = mount(ApolloQuery, {
      props: { query: THINGS_QUERY, variables: { term: 'a' }, clientId: 'analytics' },
      slots: { data: dataSlot },
      global: provideClients({ analytics, default: fallback }),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('a1|false')
    expect(analyticsCalls).toHaveLength(1)
    expect(fallbackCalls).toHaveLength(0)

    wrapper.unmount()
  })
})
