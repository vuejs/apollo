import type { DocumentNode, TypedDocumentNode } from '@apollo/client'
import { gql, NetworkStatus } from '@apollo/client'
import { computed, effectScope, isReactive, reactive, ref } from '@vue/reactivity'
import { defineComponent, h, nextTick, Suspense } from '@vue/runtime-core'
import { createSSRApp } from '@vue/runtime-dom'
import { renderToString } from '@vue/server-renderer'
import { mount } from '@vue/test-utils'
import { promiseTimeout, until } from '@vueuse/core'
import { afterAll, afterEach, assertType, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApolloClient } from './test-utils/client.ts'
import { startServer, stopServer } from './test-utils/server.ts'
import { DefaultApolloClient, provideApolloClient } from './useApolloClient.ts'
import { useGlobalQueryLoading, useQueryLoading } from './useLoading.ts'
import { useQuery } from './useQuery.ts'

const PORT = Number.parseInt(process.env.PORT ?? '4000')

let server: ReturnType<typeof startServer> | undefined
const apolloClient = createApolloClient(PORT)

// #region Query Definitions
const HELLO_QUERY = gql`
  query {
    hello
  }
` as TypedDocumentNode<{ hello: string }, {}>

const ECHO_QUERY = gql`
  query Echo($message: String!) {
    echo(message: $message)
  }
` as TypedDocumentNode<{ echo: string }, { message: string }>

const ECHO3_QUERY = gql`
  query Echo3($message1: String!, $message2: String!, $message3: String!) {
    echo1: echo(message: $message1)
    echo2: echo(message: $message2)
    echo3: echo(message: $message3)
  }
` as TypedDocumentNode<
  { echo1: string, echo2: string, echo3: string },
  { message1: string, message2: string, message3: string }
>

const ERROR_QUERY = gql`
  query CanThrowError($shouldError: Boolean!) {
    canThrowError(shouldError: $shouldError)
  }
` as TypedDocumentNode<{ canThrowError: string }, { shouldError: boolean }>

const SLOW_QUERY = gql`
  query Slow {
    slow(delay: 50)
  }
` as TypedDocumentNode<{ slow: string }, {}>

const PAGINATED_TODOS = gql`
  query PaginatedTodos($limit: Int!, $offset: Int!) {
    paginatedTodos(limit: $limit, offset: $offset) {
      items { id text }
      totalCount
      hasMore
    }
  }
` as TypedDocumentNode<{
  paginatedTodos: {
    items: Array<{ id: string, text: string }>
    totalCount: number
    hasMore: boolean
  }
}, { limit: number, offset: number }>

// Streaming queries (@stream / @defer)
const STREAM_NUMBERS = gql`
  query StreamNumbers($count: Int!) {
    numbers(count: $count) @stream(initialCount: 0)
  }
` as TypedDocumentNode<{ numbers: number[] }, { count: number }>

const DEFER_QUERY = gql`
  query DeferQuery {
    hello
    ... @defer {
      slow(delay: 1000)
    }
  }
` as TypedDocumentNode<{ hello: string, slow?: string }, {}>

const DEFER_FAST_QUERY = gql`
  query DeferFastQuery {
    hello
    ... @defer {
      slow(delay: 150)
    }
  }
` as TypedDocumentNode<{ hello: string, slow?: string }, {}>

// Subscription for subscribeToMore test
const COUNTER_SUBSCRIPTION = gql`
  subscription Counter {
    counter
  }
` as TypedDocumentNode<{ counter: number }, {}>

const INCREMENT_COUNTER = gql`
  mutation IncrementCounter {
    incrementCounter
  }
` as TypedDocumentNode<{ incrementCounter: number }, {}>

// Query with nested data for returnPartialData test
const USER_WITH_TODOS = gql`
  query UserWithTodos($id: ID!) {
    user(id: $id) {
      id
      name
      todos {
        id
        text
      }
    }
  }
` as TypedDocumentNode<{
  user: {
    id: string
    name: string
    todos: Array<{ id: string, text: string }>
  } | null
}, { id: string }>
// #endregion

const RESET_MUTATION = gql`mutation { reset }`

describe('useQuery', () => {
  beforeAll(() => {
    server = startServer(PORT)
  })

  afterEach(async () => {
    await apolloClient.mutate({ mutation: RESET_MUTATION })
    await apolloClient.clearStore()
  })

  // #region Basic Functionality
  it('should execute query, be initially loading, complete with result, expose discriminated union types', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current } = useQuery(HELLO_QUERY)

        if (current.value.resultState === 'complete' || current.value.resultState === 'streaming') {
          assertType<{ hello: string }>(current.value.result)
        }
        else if (current.value.resultState === 'empty') {
          assertType<undefined>(current.value.result)
        }

        return { current }
      },
      render() {
        return h('div', this.current.loading ? 'Loading...' : this.current.resultState === 'complete' ? this.current.result.hello : 'Impossible State')
      },
    })

    const wrapper = mount(TestComponent, {
      global: {
        provide: {
          [DefaultApolloClient]: apolloClient,
        },
      },
    })

    expect(wrapper.find('div').text()).toEqual('Loading...')
    await until(() => wrapper.vm.current.loading).toBe(false, { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })

  it('should pass a plain DocumentNode to Apollo by reference, without reactive wrapping', async () => {
    const spy = vi.spyOn(apolloClient, 'watchQuery')

    const TestComponent = defineComponent({
      setup() {
        const { current } = useQuery(HELLO_QUERY)
        return { current }
      },
      render() {
        return h('div', this.current.loading ? 'loading' : 'done')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => spy.mock.calls.length > 0).toBe(true, { timeout: 200 })
    const passedQuery = spy.mock.calls[0]?.[0].query
    expect(passedQuery).toBe(HELLO_QUERY)
    expect(isReactive(passedQuery)).toBe(false)

    spy.mockRestore()
    wrapper.unmount()
  })
  // #endregion

  // #region Options Reactivity
  it('should react to options as ref', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const options = ref({ variables: { message: message.value } })
        const { current } = useQuery(ECHO_QUERY, options)

        return { current, message, options }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.options = { variables: { message: 'world' } }
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })

  it('should react to options as computed', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const options = computed(() => ({ variables: { message: message.value } }))
        const { current } = useQuery(ECHO_QUERY, options)

        return { current, message }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.message = 'world'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })

  it('should react to options as getter', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const { current } = useQuery(ECHO_QUERY, () => ({ variables: { message: message.value } }))

        return { current, message }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.message = 'world'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })
  // #endregion

  // #region Variables Reactivity
  it('should react to variables as ref', async () => {
    const TestComponent = defineComponent({
      setup() {
        const variables = ref({ message: 'hello' })
        const { current } = useQuery(ECHO_QUERY, { variables })

        return { current, variables }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.variables = { message: 'world' }
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })

  it('should react to variables as computed', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const variables = computed(() => ({ message: message.value }))
        const { current } = useQuery(ECHO_QUERY, { variables })

        return { current, message }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.message = 'world'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })

  it('should react to variables as getter', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const { current } = useQuery(ECHO_QUERY, { variables: () => ({ message: message.value }) })

        return { current, message }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.message = 'world'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })

  it('should react to variables as reactive (mutating properties)', async () => {
    const TestComponent = defineComponent({
      setup() {
        const variables = reactive({ message: 'hello' })
        const { current } = useQuery(ECHO_QUERY, { variables })

        return { current, variables }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('hello')

    wrapper.vm.variables.message = 'world'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('world')

    wrapper.unmount()
  })
  // #endregion

  // #region Variable-level Reactivity
  it('should react to individual variables (ref, computed, getter mixed)', async () => {
    const TestComponent = defineComponent({
      setup() {
        const msg1 = ref('a')
        const msg2Source = ref('b')
        const msg2 = computed(() => msg2Source.value)
        const msg3Source = ref('c')

        const { current } = useQuery(ECHO3_QUERY, {
          variables: {
            message1: msg1,
            message2: msg2,
            message3: () => msg3Source.value,
          },
        })

        return { current, msg1, msg2Source, msg3Source }
      },
      render() {
        if (this.current.resultState !== 'complete')
          return h('div', 'loading')
        return h('div', `${this.current.result.echo1}-${this.current.result.echo2}-${this.current.result.echo3}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('a-b-c')

    wrapper.vm.msg1 = 'x'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('x-b-c')

    wrapper.vm.msg2Source = 'y'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('x-y-c')

    wrapper.vm.msg3Source = 'z'
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toEqual('x-y-z')

    wrapper.unmount()
  })
  // #endregion

  // #region Debounce/Throttle
  it('should debounce variable changes when debounce option is set', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('first')
        const results: string[] = []
        const { current, onResult } = useQuery(ECHO_QUERY, {
          variables: { message },
          debounce: 100,
        })

        onResult((data) => {
          results.push(data.echo)
        })

        return { current, message, results }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // First query executes immediately
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.results).toEqual(['first'])

    // Rapid updates - only last should go through after debounce
    wrapper.vm.message = 'second'
    await nextTick()
    wrapper.vm.message = 'third'
    await nextTick()
    wrapper.vm.message = 'fourth'

    // Wait for debounce + query
    await promiseTimeout(150)
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })

    // Should have first and fourth (debounced skips second and third)
    expect(wrapper.vm.results).toEqual(['first', 'fourth'])

    wrapper.unmount()
  })

  it('should throttle variable changes when throttle option is set', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('first')
        const results: string[] = []
        const { current, onResult } = useQuery(ECHO_QUERY, {
          variables: { message },
          throttle: 100,
        })

        onResult((data) => {
          results.push(data.echo)
        })

        return { current, message, results }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // First query executes immediately
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.results).toEqual(['first'])

    // Rapid updates - first goes through immediately due to leading edge
    wrapper.vm.message = 'second'
    await nextTick()
    wrapper.vm.message = 'third'
    await nextTick()
    wrapper.vm.message = 'fourth'

    // Wait for throttle to process (leading edge: second, trailing edge: fourth)
    await promiseTimeout(250)
    await until(() => wrapper.vm.current.loading).toBe(false, { timeout: 200 })

    // Should have first, second (leading), and fourth (trailing)
    // Third should be skipped
    expect(wrapper.vm.results).toContain('first')
    expect(wrapper.vm.results).toContain('second')
    expect(wrapper.vm.results).toContain('fourth')
    expect(wrapper.vm.results).not.toContain('third')

    wrapper.unmount()
  })
  // #endregion

  // #region Enabled State
  it('should not execute when enabled is false', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, query } = useQuery(HELLO_QUERY, { enabled: false })
        return { current, query }
      },
      render() {
        return h('div', this.query ? 'has query' : 'no query')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Should not have observable query
    expect(wrapper.vm.query).toBeUndefined()
    expect(wrapper.vm.current.loading).toBe(false)
    expect(wrapper.find('div').text()).toBe('no query')

    wrapper.unmount()
  })

  it('should execute when enabled changes from false to true', async () => {
    const TestComponent = defineComponent({
      setup() {
        const enabled = ref(false)
        const { current, query } = useQuery(HELLO_QUERY, { enabled })
        return { current, query, enabled }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.hello : 'no result')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    expect(wrapper.vm.query).toBeUndefined()
    expect(wrapper.find('div').text()).toBe('no result')

    // Enable the query
    wrapper.vm.enabled = true
    await until(() => wrapper.vm.query).toBeTruthy({ timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('world')

    wrapper.unmount()
  })

  it('should stop when enabled changes from true to false', async () => {
    const TestComponent = defineComponent({
      setup() {
        const enabled = ref(true)
        const { current, query } = useQuery(HELLO_QUERY, { enabled })
        return { current, query, enabled }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.hello : 'no result')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.query).toBeDefined()

    // Disable the query
    wrapper.vm.enabled = false
    await nextTick()
    expect(wrapper.vm.query).toBeUndefined()

    wrapper.unmount()
  })

  it('should start with the resolved variables when enabled and variables land in the same tick', async () => {
    const spy = vi.spyOn(apolloClient, 'watchQuery')

    const TestComponent = defineComponent({
      setup() {
        const open = ref(false)
        const { current, variables } = useQuery(ECHO_QUERY, () =>
          !open.value
            ? { enabled: false }
            : { variables: { message: 'hello' }, fetchPolicy: 'no-cache' as const })

        return { current, variables, open }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'no result')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    expect(spy).not.toHaveBeenCalled()

    // One write turns the query on and gives it its variables.
    wrapper.vm.open = true

    expect(spy.mock.calls[0]?.[0].variables).toEqual({ message: 'hello' })
    expect(wrapper.vm.variables).toEqual({ message: 'hello' })
    expect(wrapper.vm.current.loading).toBe(true)

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('hello')
    expect(wrapper.vm.current.loading).toBe(false)

    spy.mockRestore()
    wrapper.unmount()
  })
  // #endregion

  // #region Lifecycle
  it('start() should resume a stopped query', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, query, start, stop } = useQuery(HELLO_QUERY)
        return { current, query, start, stop }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.hello : 'no result')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })

    wrapper.vm.stop()
    await nextTick()
    expect(wrapper.vm.query).toBeUndefined()

    wrapper.vm.start()
    await until(() => wrapper.vm.query).toBeTruthy({ timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('world')

    wrapper.unmount()
  })

  it('restart() should stop and restart the query', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const { current, restart, variables } = useQuery(ECHO_QUERY, { variables: { message } })
        return { current, restart, variables, message }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('hello')

    wrapper.vm.message = 'world'
    await wrapper.vm.restart()
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('world')

    wrapper.unmount()
  })
  // #endregion

  // #region Events
  it('onResult should fire when result is received', async () => {
    const TestComponent = defineComponent({
      setup() {
        const results: string[] = []
        const { current, onResult } = useQuery(HELLO_QUERY)

        onResult((data) => {
          results.push(data.hello)
        })

        return { current, results }
      },
      render() {
        return h('div', this.results.join(','))
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.results).toEqual(['world'])

    wrapper.unmount()
  })

  it('onError should fire when error occurs', async () => {
    const TestComponent = defineComponent({
      setup() {
        const errors: string[] = []
        const { current, onError } = useQuery(ERROR_QUERY, {
          variables: { shouldError: true },
        })

        onError((error) => {
          errors.push(error.message)
        })

        return { current, errors }
      },
      render() {
        return h('div', this.errors.join(','))
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.errors.length).toBe(1, { timeout: 200 })
    expect(wrapper.vm.errors[0]).toBeTruthy()

    wrapper.unmount()
  })
  // #endregion

  // #region Query Methods
  it('refetch() should re-execute the query', async () => {
    const TestComponent = defineComponent({
      setup() {
        const resultCount = ref(0)
        const { current, refetch, onResult } = useQuery(HELLO_QUERY)

        onResult(() => {
          resultCount.value++
        })

        return { current, refetch, resultCount }
      },
      render() {
        return h('div', `${this.current.resultState}-${this.resultCount}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.resultCount).toBe(1)

    // Refetch
    await wrapper.vm.refetch()
    expect(wrapper.vm.resultCount).toBe(2)

    wrapper.unmount()
  })

  it('refetch(variables) should re-execute with temporary variables', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('hello')
        const { current, refetch, variables } = useQuery(ECHO_QUERY, { variables: { message } })

        return { current, refetch, variables, message }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('hello')

    // Refetch with different variables (temporary)
    const result = await wrapper.vm.refetch({ message: 'temporary' })
    expect(result?.result?.echo).toBe('temporary')

    // Original variables ref should remain unchanged
    expect(wrapper.vm.variables.message).toBe('hello')

    wrapper.unmount()
  })

  it('fetchMore() should fetch additional data', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, fetchMore } = useQuery(ECHO_QUERY, {
          variables: { message: 'first' },
        })

        return { current, fetchMore }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.echo : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })

    // FetchMore returns a result
    const moreResult = await wrapper.vm.fetchMore({ variables: { message: 'second' } })
    expect(moreResult?.result?.echo).toBe('second')

    wrapper.unmount()
  })

  it('updateQuery() should update cached result', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, updateQuery } = useQuery(HELLO_QUERY)

        return { current, updateQuery }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.hello : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('world')

    // Update the cached result
    wrapper.vm.updateQuery((_, { previousData }) => ({
      ...previousData,
      hello: 'updated',
    }))

    // Wait for cache update to propagate through subscription
    await until(() => wrapper.find('div').text()).toBe('updated', { timeout: 200 })

    wrapper.unmount()
  })
  // #endregion

  // #region Error Handling
  it('should set error ref when query fails', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, error } = useQuery(ERROR_QUERY, {
          variables: { shouldError: true },
        })
        return { current, error }
      },
      render() {
        return h('div', this.error ? this.error.message : 'no error')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.error).toBeTruthy({ timeout: 200 })
    expect(wrapper.vm.error?.message).toBeTruthy()

    wrapper.unmount()
  })
  // #endregion

  // #region PromiseLike
  it('should be awaitable with Suspense', async () => {
    const AsyncChild = defineComponent({
      async setup() {
        const { result } = await useQuery(HELLO_QUERY)
        return { result }
      },
      render() {
        return h('span', { class: 'result' }, this.result?.hello ?? 'no result')
      },
    })

    const ParentComponent = defineComponent({
      components: { AsyncChild },
      render() {
        return h(Suspense, null, {
          default: () => h(AsyncChild),
          fallback: () => h('span', { class: 'loading' }, 'Loading...'),
        })
      },
    })

    const wrapper = mount(ParentComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Should show loading fallback first
    expect(wrapper.find('.loading').exists()).toBe(true)

    // Wait for async setup to resolve
    await until(() => wrapper.find('.result').exists()).toBe(true, { timeout: 500 })
    expect(wrapper.find('.result').text()).toBe('world')

    wrapper.unmount()
  })
  // #endregion

  // #region Polling
  it('should poll at specified interval when pollInterval is set', async () => {
    const TestComponent = defineComponent({
      setup() {
        const resultCount = ref(0)
        const { current, onResult } = useQuery(HELLO_QUERY, {
          pollInterval: 100,
        })

        onResult(() => {
          resultCount.value++
        })

        return { current, resultCount }
      },
      render() {
        return h('div', `${this.resultCount}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.resultCount).toBe(1)

    // Wait for at least 2 more polls
    await promiseTimeout(250)
    expect(wrapper.vm.resultCount).toBeGreaterThanOrEqual(3)

    wrapper.unmount()
  })

  it('should stop polling when query is stopped', async () => {
    const TestComponent = defineComponent({
      setup() {
        const resultCount = ref(0)
        const { current, stop, onResult } = useQuery(HELLO_QUERY, {
          pollInterval: 100,
        })

        onResult(() => {
          resultCount.value++
        })

        return { current, stop, resultCount }
      },
      render() {
        return h('div', `${this.resultCount}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    const countBeforeStop = wrapper.vm.resultCount

    wrapper.vm.stop()
    await promiseTimeout(250)

    // Should not have polled after stop
    expect(wrapper.vm.resultCount).toBe(countBeforeStop)

    wrapper.unmount()
  })
  // #endregion

  // #region Network Status
  it('should expose networkStatus ref', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, networkStatus } = useQuery(HELLO_QUERY)
        return { current, networkStatus }
      },
      render() {
        return h('div', `${this.networkStatus}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Initially loading
    expect(wrapper.vm.networkStatus).toBe(NetworkStatus.loading)

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    // Ready
    expect(wrapper.vm.networkStatus).toBe(NetworkStatus.ready)

    wrapper.unmount()
  })
  // #endregion

  // #region Loading Tracking
  it('should integrate with useQueryLoading', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current: current1 } = useQuery(HELLO_QUERY)
        const { current: current2 } = useQuery(ECHO_QUERY, { variables: { message: 'test' } })
        const loading = useQueryLoading()

        return { current1, current2, loading }
      },
      render() {
        return h('div', this.loading ? 'loading' : 'done')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Wait for watch to fire (tracks loading state changes)
    await nextTick()
    expect(wrapper.vm.loading).toBe(true)

    // Wait for both queries to complete
    await until(() => wrapper.vm.current1.resultState).toBe('complete', { timeout: 200 })
    await until(() => wrapper.vm.current2.resultState).toBe('complete', { timeout: 200 })

    expect(wrapper.vm.loading).toBe(false)

    wrapper.unmount()
  })

  it('should integrate with useGlobalQueryLoading', async () => {
    const globalLoading = useGlobalQueryLoading()

    const TestComponent = defineComponent({
      setup() {
        const { current } = useQuery(HELLO_QUERY)
        return { current }
      },
      render() {
        return h('div', this.current.loading ? 'loading' : 'done')
      },
    })

    // Before mounting, no queries loading
    expect(globalLoading.value).toBe(false)

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Wait for watch to fire (tracks loading state changes)
    await nextTick()
    expect(globalLoading.value).toBe(true)

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(globalLoading.value).toBe(false)

    wrapper.unmount()
  })
  // #endregion

  // #region Document Changes
  it('should react to document ref changes', async () => {
    const TestComponent = defineComponent({
      setup() {
        const doc = ref<DocumentNode>(HELLO_QUERY)
        const { current } = useQuery(doc)
        return { current, doc }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? JSON.stringify(this.current.result) : 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.current.result).toHaveProperty('hello', 'world')

    // Change the document to SLOW_QUERY (no required variables)
    wrapper.vm.doc = SLOW_QUERY as DocumentNode
    await until(() => wrapper.vm.current.loading).toBe(true, { timeout: 200 })
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.current.result).toHaveProperty('slow')

    wrapper.unmount()
  })
  // #endregion

  // #region Options Changes
  it('keepPreviousResult should preserve result during refetch', async () => {
    const TestComponent = defineComponent({
      setup() {
        const message = ref('first')
        const { current, result } = useQuery(ECHO_QUERY, {
          variables: { message },
          keepPreviousResult: true,
        })
        return { current, result, message }
      },
      render() {
        return h('div', this.result?.echo ?? 'no result')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('first')
    expect(wrapper.vm.current.isPreviousResult).toBe(false)

    // Change variables - should keep previous result while loading
    wrapper.vm.message = 'second'
    await nextTick()

    // Result should still be 'first' while loading, reported as a retained result rather
    // than as an empty one.
    expect(wrapper.vm.result?.echo).toBe('first')
    expect(wrapper.vm.current.resultState).toBe('complete')
    expect(wrapper.vm.current.isPreviousResult).toBe(true)
    expect(wrapper.vm.current.loading).toBe(true)

    await until(() => wrapper.vm.current.isPreviousResult).toBe(false, { timeout: 200 })
    expect(wrapper.find('div').text()).toBe('second')

    wrapper.unmount()
  })

  it('should apply new options without reobserve for non-critical option changes', async () => {
    const TestComponent = defineComponent({
      setup() {
        const pollInterval = ref<number | undefined>(undefined)
        const resultCount = ref(0)
        const { current, onResult } = useQuery(HELLO_QUERY, () => ({
          pollInterval: pollInterval.value,
        }))

        onResult(() => {
          resultCount.value++
        })

        return { current, pollInterval, resultCount }
      },
      render() {
        return h('div', `${this.resultCount}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.resultCount).toBe(1)

    // Enable polling - should apply without full reobserve
    wrapper.vm.pollInterval = 100
    await promiseTimeout(250)

    // Should have polled at least twice
    expect(wrapper.vm.resultCount).toBeGreaterThanOrEqual(3)

    wrapper.unmount()
  })
  // #endregion

  // #region Cleanup
  it('should cleanup subscription on component unmount', async () => {
    const onResultSpy = vi.fn()

    const TestComponent = defineComponent({
      setup() {
        const { current, onResult } = useQuery(HELLO_QUERY, {
          pollInterval: 50,
        })

        onResult(onResultSpy)

        return { current }
      },
      render() {
        return h('div', 'test')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    const countBeforeUnmount = onResultSpy.mock.calls.length

    // Unmount the component
    wrapper.unmount()

    // Wait to ensure no more callbacks
    await promiseTimeout(150)

    // Should not have received more results after unmount
    expect(onResultSpy.mock.calls.length).toBe(countBeforeUnmount)
  })

  it('should stop observableQuery on component unmount', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, query } = useQuery(HELLO_QUERY)
        return { current, query }
      },
      render() {
        return h('div', 'test')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.query).toBeDefined()

    // Unmount the component
    wrapper.unmount()

    // After unmount, the query ref from the unmounted component is no longer accessible
    // but onScopeDispose was called to stop the query
  })
  // #endregion

  // #region fetchMore with updateQuery
  it('fetchMore() with updateQuery should merge results', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current, fetchMore, result } = useQuery(PAGINATED_TODOS, {
          variables: { limit: 2, offset: 0 },
        })

        return { current, fetchMore, result }
      },
      render() {
        return h('div', this.result?.paginatedTodos?.items?.length ?? 0)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })
    expect(wrapper.vm.result?.paginatedTodos.items).toHaveLength(2)
    expect(wrapper.vm.result?.paginatedTodos.hasMore).toBe(true)

    // FetchMore with updateQuery to merge results
    const moreResult = await wrapper.vm.fetchMore({
      variables: { limit: 2, offset: 2 },
      updateQuery: (previousQueryResult, { fetchMoreResult }) => ({
        paginatedTodos: {
          ...fetchMoreResult.paginatedTodos,
          items: [
            ...previousQueryResult.paginatedTodos.items,
            ...fetchMoreResult.paginatedTodos.items,
          ],
        },
      }),
    })

    // fetchMore returns the raw new result (not merged)
    expect(moreResult?.result?.paginatedTodos.items).toHaveLength(2)

    // Wait for cache update to propagate through subscription
    await until(() => wrapper.vm.result?.paginatedTodos?.items?.length).toBe(4, { timeout: 200 })

    wrapper.unmount()
  })
  // #endregion

  // #region skipPollAttempt
  it('should respect skipPollAttempt callback', async () => {
    let pollAttempts = 0
    let skippedPolls = 0

    const TestComponent = defineComponent({
      setup() {
        const { current, onResult } = useQuery(HELLO_QUERY, {
          pollInterval: 50,
          skipPollAttempt: () => {
            pollAttempts++
            // Skip every other poll
            if (pollAttempts % 2 === 0) {
              skippedPolls++
              return true
            }
            return false
          },
        })

        return { current, onResult }
      },
      render() {
        return h('div', 'test')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })

    // Wait for some poll cycles
    await promiseTimeout(300)

    // Should have attempted several polls and skipped some
    expect(pollAttempts).toBeGreaterThan(0)
    expect(skippedPolls).toBeGreaterThan(0)

    wrapper.unmount()
  })
  // #endregion

  // #region notifyOnNetworkStatusChange
  it('should emit state events during refetch when notifyOnNetworkStatusChange is true', async () => {
    const stateCount = { withOption: 0, withoutOption: 0 }

    // Test with notifyOnNetworkStatusChange
    const TestComponentWith = defineComponent({
      setup() {
        const { current, refetch, onNextState } = useQuery(HELLO_QUERY, {
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'network-only',
        })

        onNextState(() => {
          stateCount.withOption++
        })

        return { current, refetch }
      },
      render() {
        return h('div', 'test')
      },
    })

    const wrapper1 = mount(TestComponentWith, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper1.vm.current.resultState).toBe('complete', { timeout: 200 })
    const countBeforeRefetch = stateCount.withOption

    await wrapper1.vm.refetch()
    wrapper1.unmount()

    // Test without notifyOnNetworkStatusChange
    const TestComponentWithout = defineComponent({
      setup() {
        const { current, refetch, onNextState } = useQuery(HELLO_QUERY, {
          fetchPolicy: 'network-only',
        })

        onNextState(() => {
          stateCount.withoutOption++
        })

        return { current, refetch }
      },
      render() {
        return h('div', 'test')
      },
    })

    const wrapper2 = mount(TestComponentWithout, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    await until(() => wrapper2.vm.current.resultState).toBe('complete', { timeout: 200 })
    const countBeforeRefetch2 = stateCount.withoutOption

    await wrapper2.vm.refetch()
    wrapper2.unmount()

    // With notifyOnNetworkStatusChange, should get more state events during refetch
    const refetchEventsWithOption = stateCount.withOption - countBeforeRefetch
    const refetchEventsWithoutOption = stateCount.withoutOption - countBeforeRefetch2

    expect(refetchEventsWithOption).toBeGreaterThanOrEqual(refetchEventsWithoutOption)
  })
  // #endregion

  // #region Streaming (@defer/@stream)
  it('should emit streaming states for @stream queries', async () => {
    const states: string[] = []

    const TestComponent = defineComponent({
      setup() {
        const { current, onNextState, result } = useQuery(STREAM_NUMBERS, {
          variables: { count: 5 },
        })

        onNextState((state) => {
          states.push(state.resultState)
        })

        return { current, result }
      },
      render() {
        return h('div', JSON.stringify(this.result?.numbers ?? []))
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Wait for all numbers to arrive
    await until(() => wrapper.vm.result?.numbers?.length).toBe(5, { timeout: 1000 })

    // Should have seen streaming states
    expect(states).toContain('streaming')

    // Wait for streaming to complete
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 2000 })
    expect(states).toContain('complete')

    // Final result should have all 5 numbers
    expect(wrapper.vm.result?.numbers).toEqual([1, 2, 3, 4, 5])

    // Sometimes HTTP requests may still be in flight, wait a bit before ending the test
    await promiseTimeout(100)

    wrapper.unmount()
  })

  it('should emit streaming states for @defer queries', async () => {
    const states: string[] = []

    const TestComponent = defineComponent({
      setup() {
        const { current, onNextState, result } = useQuery(DEFER_QUERY)

        onNextState((state) => {
          states.push(state.resultState)
        })

        return { current, result }
      },
      render() {
        return h('div', `hello: ${this.result?.hello}, slow: ${this.result?.slow}`)
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Wait for deferred field to arrive
    await until(() => wrapper.vm.result?.slow).toBeTruthy({ timeout: 500 })

    // Should have seen streaming state (from @defer)
    expect(states).toContain('streaming')

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 2000 })

    // Both fields should be present
    expect(wrapper.vm.result?.hello).toBe('world')
    expect(wrapper.vm.result?.slow).toBe('done')

    // Sometimes HTTP requests may still be in flight, wait a bit before ending the test
    await promiseTimeout(100)

    wrapper.unmount()
  })

  it('result type should be available when resultState is streaming', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { current } = useQuery(STREAM_NUMBERS, {
          variables: { count: 3 },
        })

        // Type check: when streaming, result should be available
        if (current.value.resultState === 'streaming') {
          assertType<{ numbers: number[] }>(current.value.result)
        }

        return { current }
      },
      render() {
        const { resultState, result } = this.current
        if (resultState === 'streaming' || resultState === 'complete') {
          return h('div', `numbers: ${result.numbers.length}`)
        }
        return h('div', 'loading')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: apolloClient } },
    })

    // Wait for all numbers to arrive
    await until(() => wrapper.vm.current.result?.numbers?.length).toBe(3, { timeout: 1000 })

    // Wait for streaming to complete
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 2000 })
    expect(wrapper.vm.current.result?.numbers).toHaveLength(3)

    // Sometimes HTTP requests may still be in flight, wait a bit before ending the test
    await promiseTimeout(100)

    wrapper.unmount()
  })
  // #endregion

  // #region subscribeToMore
  // TODO: This test is flaky, needs investigation
  it('subscribeToMore() should subscribe to additional data', async () => {
    const counterValues: number[] = []

    const TestComponent = defineComponent({
      setup() {
        const { current, subscribeToMore } = useQuery(HELLO_QUERY)

        // Subscribe to counter updates
        subscribeToMore({
          document: COUNTER_SUBSCRIPTION,
          updateQuery: (prev, { subscriptionData }) => {
            if (subscriptionData.data) {
              counterValues.push(subscriptionData.data.counter)
            }
            return prev as { hello: string }
          },
        })

        return { current }
      },
      render() {
        return h('div', this.current.resultState === 'complete' ? this.current.result.hello : 'loading')
      },
    })

    const client = apolloClient
    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: client } },
    })

    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })

    // Trigger counter subscription by calling the mutation
    await client.mutate({ mutation: INCREMENT_COUNTER })
    await promiseTimeout(500)

    // Should have received the counter value
    expect(counterValues.length).toBeGreaterThanOrEqual(1)

    // Sometimes HTTP requests may still be in flight, wait a bit before ending the test
    await promiseTimeout(100)

    wrapper.unmount()
  })
  // #endregion

  // #region returnPartialData
  it('should support returnPartialData option', async () => {
    const client = apolloClient

    // First, populate the cache with user data (without todos)
    const USER_ONLY = gql`
      query UserOnly($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    ` as TypedDocumentNode<{ user: { id: string, name: string } | null }, { id: string }>

    await client.query({ query: USER_ONLY, variables: { id: '1' } })

    const TestComponent = defineComponent({
      setup() {
        // Query for user with todos, but with returnPartialData enabled
        const { current, result } = useQuery(USER_WITH_TODOS, {
          variables: { id: '1' },
          returnPartialData: true,
        })

        return { current, result }
      },
      render() {
        return h('div', this.result?.user?.name ?? 'no user')
      },
    })

    const wrapper = mount(TestComponent, {
      global: { provide: { [DefaultApolloClient]: client } },
    })

    // With returnPartialData, we should immediately get the cached user name
    // even though todos might not be in cache yet
    await until(() => wrapper.vm.result?.user?.name).toBe('Alice', { timeout: 200 })

    // Wait for full query to complete
    await until(() => wrapper.vm.current.resultState).toBe('complete', { timeout: 200 })

    // Now we should have the full data including todos
    expect(wrapper.vm.result?.user?.todos).toBeDefined()

    wrapper.unmount()
  })
  // #endregion

  // #region SSR
  it('ssr: async component with Suspense should render data', async () => {
    const AsyncChild = defineComponent({
      async setup() {
        const { result } = await useQuery(HELLO_QUERY)
        return { result }
      },
      render() {
        return h('span', { class: 'result' }, this.result?.hello ?? 'no result')
      },
    })

    const App = defineComponent({
      render() {
        return h(Suspense, null, {
          default: () => h(AsyncChild),
          fallback: () => h('span', { class: 'loading' }, 'Loading...'),
        })
      },
    })

    const app = createSSRApp(App)
    app.provide(DefaultApolloClient, apolloClient)

    const html = await renderToString(app)
    expect(html).toContain('world')
    expect(html).toContain('class="result"')
  })

  it('ssr: regular component should prefetch via onServerPrefetch', async () => {
    const TestComponent = defineComponent({
      setup() {
        const { result } = useQuery(HELLO_QUERY)
        return { result }
      },
      render() {
        return h('div', { class: 'data' }, this.result?.hello ?? 'no data')
      },
    })

    const app = createSSRApp(TestComponent)
    app.provide(DefaultApolloClient, apolloClient)

    const html = await renderToString(app)
    expect(html).toContain('world')
    expect(html).toContain('class="data"')
  })
  // #endregion

  // #region awaitComplete
  it('should resolve on the first non-empty state by default', async () => {
    const scope = effectScope()
    const query = scope.run(() =>
      provideApolloClient(apolloClient)(() => useQuery(DEFER_FAST_QUERY)),
    )!

    await query
    expect(query.current.value.resultState).toBe('streaming')
    expect(query.result.value?.slow).toBeUndefined()

    scope.stop()
  })

  it('awaitComplete should wait for the deferred data', async () => {
    const scope = effectScope()
    const query = scope.run(() =>
      provideApolloClient(apolloClient)(() => useQuery(DEFER_FAST_QUERY, { awaitComplete: true })),
    )!

    await query
    expect(query.current.value.resultState).toBe('complete')
    expect(query.result.value?.slow).toBe('done')

    scope.stop()
  })
  // #endregion

  afterAll(() => {
    apolloClient.stop()
    stopServer(server)
  })
})
