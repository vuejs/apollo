import type { Component } from 'vue'
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import ApolloFragmentGeneric from './ApolloFragment.vue'
import { captureWatchFragment, THING_FRAGMENT } from './test-utils/client.ts'
import { provideClient, provideClients, waitFor } from './test-utils/mount.ts'

const ApolloFragment = ApolloFragmentGeneric as unknown as Component

function createClient(thing: { id: string, label?: string }) {
  const client = new ApolloClient({
    link: new MockLink([], { showWarnings: false }),
    cache: new InMemoryCache(),
  })
  client.cache.writeFragment({
    id: `Thing:${thing.id}`,
    fragment: THING_FRAGMENT,
    data: { __typename: 'Thing', ...thing } as never,
  })
  return client
}

function mountFragment(client: ApolloClient, id: string, slots: Record<string, any>) {
  return mount(ApolloFragment, {
    props: { fragment: THING_FRAGMENT, from: { __typename: 'Thing', id } },
    slots,
    global: provideClient(client),
  })
}

const dataSlot = (p: any) => h('div', { class: 'data' }, p.data.label)

describe('apolloFragment', () => {
  it('renders #data when the fragment is complete', async () => {
    const wrapper = mountFragment(createClient({ id: '1', label: 'hello' }), '1', {
      data: dataSlot,
      incomplete: () => h('div', { class: 'incomplete' }, 'incomplete'),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('hello')
    expect(wrapper.find('.incomplete').exists()).toBe(false)

    wrapper.unmount()
  })

  it('renders #incomplete with the missing tree when fields are absent', async () => {
    // Written without `label`, so the fragment cannot be satisfied.
    const wrapper = mountFragment(createClient({ id: '2' }), '2', {
      data: dataSlot,
      incomplete: (p: any) =>
        h('div', { class: 'incomplete' }, `missing:${p.missing != null}`),
    })

    await waitFor(() => wrapper.find('.incomplete').exists())
    expect(wrapper.find('.incomplete').text()).toBe('missing:true')
    expect(wrapper.find('.data').exists()).toBe(false)

    wrapper.unmount()
  })

  it('passes the flattened state to #default in raw mode', async () => {
    const wrapper = mountFragment(createClient({ id: '3', label: 'raw' }), '3', {
      default: (p: any) => h('div', { class: 'raw' }, `${p.complete}|${p.result.label}`),
    })

    await waitFor(() => wrapper.find('.raw').text() === 'true|raw')

    wrapper.unmount()
  })

  it('renders #default alongside the opinionated slots', async () => {
    const wrapper = mountFragment(createClient({ id: '4', label: 'both' }), '4', {
      data: dataSlot,
      default: () => h('span', { class: 'child' }, 'child'),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.child').exists()).toBe(true)

    wrapper.unmount()
  })

  it('reacts to cache updates', async () => {
    const client = createClient({ id: '5', label: 'before' })
    const wrapper = mountFragment(client, '5', { data: dataSlot })

    await waitFor(() => wrapper.find('.data').text() === 'before')

    client.cache.writeFragment({
      id: 'Thing:5',
      fragment: THING_FRAGMENT,
      data: { __typename: 'Thing', id: '5', label: 'after' } as never,
    })

    await waitFor(() => wrapper.find('.data').text() === 'after')

    wrapper.unmount()
  })
})

describe('apolloFragment options passthrough', () => {
  function mountWith(props: Record<string, unknown>) {
    const client = createClient({ id: '9', label: 'hello' })
    const calls = captureWatchFragment(client)
    const wrapper = mount(ApolloFragment, {
      props: { fragment: THING_FRAGMENT, from: { __typename: 'Thing', id: '9' }, ...props },
      slots: { data: dataSlot },
      global: provideClient(client),
    })
    return { wrapper, calls }
  }

  it('applies `options` entries that have no dedicated prop', () => {
    const { wrapper, calls } = mountWith({ options: { fragmentName: 'ThingFields' } })

    expect(calls[0]).toMatchObject({ fragmentName: 'ThingFields' })

    wrapper.unmount()
  })

  it('does not let an absent boolean prop overwrite the same key in `options`', () => {
    // Absent boolean props are cast to `false` unless the component declares a default.
    const { wrapper, calls } = mountWith({ options: { optimistic: true } })

    expect(calls[0]).toMatchObject({ optimistic: true })

    wrapper.unmount()
  })

  it('lets a dedicated prop win over `options`', () => {
    const { wrapper, calls } = mountWith({ optimistic: false, options: { optimistic: true } })

    expect(calls[0]).toMatchObject({ optimistic: false })

    wrapper.unmount()
  })
})

describe('apolloFragment clientId', () => {
  it('resolves against the provided ApolloClients map', async () => {
    const cms = createClient({ id: '7', label: 'from cms' })
    const fallback = createClient({ id: '7', label: 'from default' })

    const wrapper = mount(ApolloFragment, {
      props: {
        fragment: THING_FRAGMENT,
        from: { __typename: 'Thing', id: '7' },
        clientId: 'cms',
      },
      slots: { data: dataSlot },
      global: provideClients({ cms, default: fallback }),
    })

    await waitFor(() => wrapper.find('.data').exists())
    expect(wrapper.find('.data').text()).toBe('from cms')

    wrapper.unmount()
  })
})
