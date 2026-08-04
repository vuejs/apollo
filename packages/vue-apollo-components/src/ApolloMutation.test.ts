import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h, ref } from 'vue'
import ApolloMutationGeneric from './ApolloMutation.vue'
import { ADD_THING, createMockClient, mockMutation } from './test-utils/client.ts'
import { provideClient, waitFor } from './test-utils/mount.ts'

const ApolloMutation = ApolloMutationGeneric as unknown as Component

/** A mutation whose variables miss every mock, so it always errors. */
function mountFailing(props: Record<string, unknown> = {}, settled: string[] = []) {
  return mount(ApolloMutation, {
    props: {
      mutation: ADD_THING,
      variables: { id: 'nope' },
      options: { errorPolicy: 'none' },
      ...props,
    },
    slots: {
      default: (slotProps: any) =>
        h('button', {
          class: 'btn',
          onClick: () => slotProps.mutate().then(
            () => settled.push('resolved'),
            () => settled.push('rejected'),
          ),
        }, 'go'),
    },
    global: provideClient(createMockClient([mockMutation('x')])),
  })
}

function mountMutation(props: Record<string, unknown> = {}) {
  return mount(ApolloMutation, {
    props: { mutation: ADD_THING, variables: { id: 'x' }, ...props },
    slots: {
      default: (slotProps: any) =>
        h('button', {
          class: 'btn',
          onClick: () => slotProps.mutate(),
        }, `${slotProps.loading}|${slotProps.called}|${slotProps.error?.message ?? '-'}`),
    },
    global: provideClient(createMockClient([mockMutation('x')])),
  })
}

describe('apolloMutation', () => {
  it('exposes mutate, loading and called, and emits done', async () => {
    const wrapper = mountMutation()

    expect(wrapper.find('.btn').text()).toBe('false|false|-')

    await wrapper.find('.btn').trigger('click')
    expect(wrapper.find('.btn').text()).toBe('true|true|-')

    await waitFor(() => wrapper.emitted('done') != null)
    expect(wrapper.find('.btn').text()).toBe('false|true|-')

    const done = wrapper.emitted('done') as unknown[][]
    expect((done[0]![0] as { data: { addThing: { id: string } } }).data.addThing.id).toBe('x')

    wrapper.unmount()
  })

  it('exposes result and reset on the slot', async () => {
    const wrapper = mount(ApolloMutation, {
      props: { mutation: ADD_THING, variables: { id: 'x' } },
      slots: {
        default: (slotProps: any) => [
          h('button', { class: 'go', onClick: () => slotProps.mutate() }),
          h('button', { class: 'reset', onClick: () => slotProps.reset() }),
          h('span', { class: 'state' }, `${slotProps.result?.addThing?.id ?? '-'}|${slotProps.called}`),
        ],
      },
      global: provideClient(createMockClient([mockMutation('x')])),
    })

    expect(wrapper.find('.state').text()).toBe('-|false')

    await wrapper.find('.go').trigger('click')
    await waitFor(() => wrapper.find('.state').text() === 'x|true')

    await wrapper.find('.reset').trigger('click')
    await waitFor(() => wrapper.find('.state').text() === '-|false')

    wrapper.unmount()
  })

  it('emits error when the mutation fails', async () => {
    const wrapper = mountFailing({ onError: () => {} })

    await wrapper.find('.btn').trigger('click')
    await waitFor(() => wrapper.emitted('error') != null)

    wrapper.unmount()
  })

  // The default `throws: 'auto'` rejects only while no `onError` handler is registered, so
  // these pin that the `@error` bridge follows the parent rather than being unconditional.
  it('rejects from mutate() when nothing is listening for @error', async () => {
    const settled: string[] = []
    const wrapper = mountFailing({}, settled)

    await wrapper.find('.btn').trigger('click')
    await waitFor(() => settled.length > 0)

    expect(settled).toEqual(['rejected'])
    expect(wrapper.emitted('error')).toBeUndefined()

    wrapper.unmount()
  })

  it('resolves from mutate() when @error is bound', async () => {
    const settled: string[] = []
    const wrapper = mountFailing({ onError: () => {} }, settled)

    await wrapper.find('.btn').trigger('click')
    await waitFor(() => settled.length > 0)

    expect(settled).toEqual(['resolved'])
    expect(wrapper.emitted('error')).toBeTruthy()

    wrapper.unmount()
  })

  it('picks up an @error listener the parent adds after mount', async () => {
    const settled: string[] = []
    const listening = ref(false)

    const parent = mount({
      setup: () => () => h(
        ApolloMutation,
        {
          mutation: ADD_THING,
          variables: { id: 'nope' },
          options: { errorPolicy: 'none' },
          ...(listening.value ? { onError: () => {} } : {}),
        },
        {
          default: (slotProps: any) => h('button', {
            class: 'btn',
            onClick: () => slotProps.mutate().then(
              () => settled.push('resolved'),
              () => settled.push('rejected'),
            ),
          }, 'go'),
        },
      ),
    }, { global: provideClient(createMockClient([mockMutation('x')])) })

    await parent.find('.btn').trigger('click')
    await waitFor(() => settled.length > 0)
    expect(settled).toEqual(['rejected'])

    listening.value = true
    await parent.vm.$nextTick()

    await parent.find('.btn').trigger('click')
    await waitFor(() => settled.length > 1)
    expect(settled).toEqual(['rejected', 'resolved'])

    parent.unmount()
  })

  it('drops the @error listener when the parent stops listening', async () => {
    const settled: string[] = []
    const listening = ref(true)

    const parent = mount({
      setup: () => () => h(
        ApolloMutation,
        {
          mutation: ADD_THING,
          variables: { id: 'nope' },
          options: { errorPolicy: 'none' },
          ...(listening.value ? { onError: () => {} } : {}),
        },
        {
          default: (slotProps: any) => h('button', {
            class: 'btn',
            onClick: () => slotProps.mutate().then(
              () => settled.push('resolved'),
              () => settled.push('rejected'),
            ),
          }, 'go'),
        },
      ),
    }, { global: provideClient(createMockClient([mockMutation('x')])) })

    await parent.find('.btn').trigger('click')
    await waitFor(() => settled.length > 0)
    expect(settled).toEqual(['resolved'])

    listening.value = false
    await parent.vm.$nextTick()

    // `throws: 'auto'` has to start rejecting again once nothing is listening.
    await parent.find('.btn').trigger('click')
    await waitFor(() => settled.length > 1)
    expect(settled).toEqual(['resolved', 'rejected'])

    parent.unmount()
  })

  it('rejects when throws is set to always, even with @error bound', async () => {
    const settled: string[] = []
    const wrapper = mountFailing(
      { onError: () => {}, options: { errorPolicy: 'none', throws: 'always' } },
      settled,
    )

    await wrapper.find('.btn').trigger('click')
    await waitFor(() => settled.length > 0)

    expect(settled).toEqual(['rejected'])

    wrapper.unmount()
  })
})
