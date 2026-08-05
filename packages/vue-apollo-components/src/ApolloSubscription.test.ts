import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, nextTick } from 'vue'
import ApolloSubscriptionGeneric from './ApolloSubscription.vue'
import { createSubscriptionClient, THING_ADDED } from './test-utils/client.ts'
import { provideClient, waitFor } from './test-utils/mount.ts'

const ApolloSubscription = ApolloSubscriptionGeneric as unknown as Component

const thing = { result: { data: { thingAdded: { __typename: 'Thing', id: 'a1' } } } }

describe('apolloSubscription', () => {
  it('renders nothing and emits result when no slot is given', async () => {
    const { client, link } = createSubscriptionClient()
    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' } },
      global: provideClient(client),
    })

    // The usual usage: a handler component with no output of its own.
    expect(wrapper.html()).toBe('')

    await nextTick()
    link.simulateResult(thing)

    await waitFor(() => wrapper.emitted('result') != null)
    const emitted = wrapper.emitted('result') as unknown[][]
    expect((emitted[0]![0] as { thingAdded: { id: string } }).thingAdded.id).toBe('a1')

    wrapper.unmount()
  })

  it('renders the default slot when given one', async () => {
    const { client, link } = createSubscriptionClient()
    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' } },
      slots: {
        default: (slotProps: any) =>
          h('div', { class: 'sub' }, slotProps.result?.thingAdded.id ?? 'none'),
      },
      global: provideClient(client),
    })

    expect(wrapper.find('.sub').text()).toBe('none')

    await nextTick()
    link.simulateResult(thing)

    await waitFor(() => wrapper.find('.sub').text() === 'a1')

    wrapper.unmount()
  })

  it('emits complete when the subscription closes', async () => {
    const { client, link } = createSubscriptionClient()
    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' } },
      global: provideClient(client),
    })

    await nextTick()
    link.simulateResult(thing, true)

    await waitFor(() => wrapper.emitted('complete') != null)

    wrapper.unmount()
  })

  it('does not subscribe while disabled, then subscribes once re-enabled', async () => {
    const { client, link } = createSubscriptionClient()
    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' }, disabled: true },
      global: provideClient(client),
    })

    await nextTick()
    expect(link.operation).toBeUndefined()
    expect(wrapper.emitted('result')).toBeUndefined()

    await wrapper.setProps({ disabled: false })
    await nextTick()
    expect(link.operation).toBeDefined()

    wrapper.unmount()
  })

  it('subscribes by default, with no `disabled` prop given', async () => {
    const { client, link } = createSubscriptionClient()
    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' } },
      global: provideClient(client),
    })

    await nextTick()
    expect(link.operation).toBeDefined()

    wrapper.unmount()
  })

  it('leaves `options.enabled` alone when `disabled` is not set', async () => {
    const { client, link } = createSubscriptionClient()
    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' }, options: { enabled: false } },
      global: provideClient(client),
    })

    await nextTick()
    expect(link.operation).toBeUndefined()

    wrapper.unmount()
  })

  // The whole lifecycle is on the slot, so pausing needs no template ref.
  it('drives the lifecycle from the default slot', async () => {
    const { client, link } = createSubscriptionClient()
    let subscribes = 0
    let unsubscribes = 0
    link.onSetup(() => {
      subscribes++
    })
    link.onUnsubscribe(() => {
      unsubscribes++
    })

    const wrapper = mount(ApolloSubscription, {
      props: { subscription: THING_ADDED, variables: { term: 'a' } },
      slots: {
        default: (slotProps: any) => [
          h('button', { class: 'stop', onClick: () => slotProps.stop() }),
          h('button', { class: 'start', onClick: () => slotProps.start() }),
          h('button', { class: 'restart', onClick: () => slotProps.restart() }),
        ],
      },
      global: provideClient(client),
    })

    await waitFor(() => subscribes === 1)

    await wrapper.find('.stop').trigger('click')
    await waitFor(() => unsubscribes === 1)

    await wrapper.find('.start').trigger('click')
    await waitFor(() => subscribes === 2)

    await wrapper.find('.restart').trigger('click')
    await waitFor(() => subscribes === 3)

    wrapper.unmount()
  })
})
