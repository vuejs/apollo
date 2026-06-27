import type { ApolloClient, TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import { ref } from '@vue/reactivity'
import { defineComponent, h, nextTick } from '@vue/runtime-core'
import { mount } from '@vue/test-utils'
import { until } from '@vueuse/core'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createApolloClient } from '../test-utils/client.ts'
import { startServer, stopServer } from '../test-utils/server.ts'
import { DefaultApolloClient } from '../useApolloClient.ts'
import { useLazyQuery, useMutation, useQuery, useSubscription } from './index.ts'

const PORT = Number.parseInt(process.env.PORT ?? '4001')

let server: ReturnType<typeof startServer> | undefined
const apolloClient = createApolloClient(PORT)

// #region GraphQL documents
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

const ERROR_QUERY = gql`
  query CanThrowError($shouldError: Boolean!) {
    canThrowError(shouldError: $shouldError)
  }
` as TypedDocumentNode<{ canThrowError: string }, { shouldError: boolean }>

const NULLABLE_ERROR_QUERY = gql`
  query NullableError($shouldError: Boolean!) {
    nullableError(shouldError: $shouldError)
  }
` as TypedDocumentNode<{ nullableError: string | null }, { shouldError: boolean }>

const PAGINATED_TODOS = gql`
  query PaginatedTodos($limit: Int!, $offset: Int!) {
    paginatedTodos(limit: $limit, offset: $offset) {
      items {
        id
        text
      }
      totalCount
      hasMore
    }
  }
` as TypedDocumentNode<
  { paginatedTodos: { items: Array<{ id: string, text: string }>, totalCount: number, hasMore: boolean } },
  { limit: number, offset: number }
>

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
` as TypedDocumentNode<
  { createUser: { id: string, name: string } },
  { input: { name: string, email: string } }
>

const FAILING_MUTATION = gql`
  mutation FailingMutation($message: String!) {
    failingMutation(message: $message)
  }
` as TypedDocumentNode<{ failingMutation: string }, { message: string }>

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

const RESET_MUTATION = gql`mutation { reset }`
// #endregion

function withTimeout<T>(promise: Promise<T>, timeout = 500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timed out waiting for promise to settle')), timeout)
    }),
  ])
}

describe('compat layer', () => {
  beforeAll(() => {
    server = startServer(PORT)
  })

  afterEach(async () => {
    await apolloClient.mutate({ mutation: RESET_MUTATION })
    await apolloClient.clearStore()
  })

  afterAll(async () => {
    apolloClient.stop()
    const disposableLink = apolloClient.link as { dispose?: () => void }
    disposableLink.dispose?.()
    await stopServer(server)
  })

  // #region useQuery
  describe('useQuery', () => {
    it('runs a query with no variables (v4 1-arg signature)', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { result, loading, error } = useQuery(HELLO_QUERY)
          return { result, loading, error }
        },
        render() {
          return h('div', this.loading ? 'Loading...' : (this.result?.hello ?? ''))
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      expect(wrapper.text()).toBe('Loading...')
      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      expect(wrapper.text()).toBe('world')
      expect(wrapper.vm.error).toBeNull()

      wrapper.unmount()
    })

    it('accepts positional variables (v4 2-arg signature)', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { result, loading } = useQuery(ECHO_QUERY, { message: 'compat' })
          return { result, loading }
        },
        render() {
          return h('div', this.loading ? 'Loading...' : (this.result?.echo ?? ''))
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      expect(wrapper.text()).toBe('compat')

      wrapper.unmount()
    })

    it('reacts to ref variables (v4 reactive 2-arg signature)', async () => {
      const TestComponent = defineComponent({
        setup() {
          const message = ref('hello')
          const { result, loading } = useQuery(ECHO_QUERY, { message })
          return { result, loading, message }
        },
        render() {
          return h('div', this.result?.echo ?? '')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      expect(wrapper.text()).toBe('hello')

      wrapper.vm.message = 'world'
      await until(() => wrapper.vm.result?.echo).toBe('world', { timeout: 500 })

      wrapper.unmount()
    })

    it('accepts options as third positional arg (v4 3-arg signature)', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { result, loading } = useQuery(
            ECHO_QUERY,
            { message: 'with-options' },
            { fetchPolicy: 'no-cache' },
          )
          return { result, loading }
        },
        render() {
          return h('div', this.result?.echo ?? '')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      expect(wrapper.text()).toBe('with-options')

      wrapper.unmount()
    })

    it('accepts variables in options for v5 migration', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { result, loading } = useQuery(ECHO_QUERY, undefined, {
            variables: { message: 'from-options' },
          })
          return { result, loading }
        },
        render() {
          return h('div', this.result?.echo ?? '')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      expect(wrapper.text()).toBe('from-options')

      wrapper.unmount()
    })

    it('error ref is null (not undefined) initially', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { error } = useQuery(HELLO_QUERY)
          return { error }
        },
        render() {
          return h('div', this.error === null ? 'null' : 'not-null')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      expect(wrapper.vm.error).toBeNull()

      wrapper.unmount()
    })

    it('error ref populates on query failure', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { error } = useQuery(ERROR_QUERY, { shouldError: true })
          return { error }
        },
        render() {
          return h('div', this.error?.message ?? '')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.error).toBeTruthy({ timeout: 500 })
      expect(wrapper.vm.error?.message).toBeTruthy()

      wrapper.unmount()
    })

    it('onResult fires with v4-shape payload and { client } context', async () => {
      const seen: Array<{ data: unknown, client: ApolloClient | null }> = []

      const TestComponent = defineComponent({
        setup() {
          const { loading, onResult } = useQuery(HELLO_QUERY)
          onResult((result, ctx) => {
            seen.push({ data: result.data, client: ctx.client })
          })
          return { loading }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      // onResult fires on every state change; at least one fire should carry the data
      const withData = seen.find(s => s.data != null)
      expect(withData).toBeDefined()
      expect(withData?.data).toEqual({ hello: 'world' })
      expect(withData?.client).toBe(apolloClient)

      wrapper.unmount()
    })

    it('fetchMore resolves with v4-shape { data } object', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { fetchMore, loading } = useQuery(PAGINATED_TODOS, {
            limit: 1,
            offset: 0,
          })
          return { fetchMore, loading }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      const more = await wrapper.vm.fetchMore({
        variables: { limit: 1, offset: 1 },
      })

      expect(more?.data.paginatedTodos.items).toHaveLength(1)
      expect(more?.data.paginatedTodos.items[0]?.text).toBe('Build Vue app')

      wrapper.unmount()
    })

    it('refetch resolves with v4-shape { data } object', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { loading, refetch } = useQuery(ECHO_QUERY, { message: 'first' })
          return { loading, refetch }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await until(() => wrapper.vm.loading).toBe(false, { timeout: 500 })
      const refetched = await wrapper.vm.refetch({ message: 'second' })
      expect(refetched?.data?.echo).toBe('second')

      wrapper.unmount()
    })
  })
  // #endregion

  // #region useMutation
  describe('useMutation', () => {
    it('mutate(variables) follows the v4 2-arg signature', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { mutate, loading, called, error } = useMutation(CREATE_USER)
          return { mutate, loading, called, error }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      expect(wrapper.vm.called).toBe(false)
      expect(wrapper.vm.error).toBeNull()

      const result = await wrapper.vm.mutate({
        input: { name: 'Alice2', email: 'alice2@example.com' },
      })

      expect(wrapper.vm.called).toBe(true)
      expect(wrapper.vm.error).toBeNull()
      expect(result?.data?.createUser.name).toBe('Alice2')

      wrapper.unmount()
    })

    it('mutate(variables, overrideOptions) passes options through', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { mutate } = useMutation(CREATE_USER)
          return { mutate }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      // override the fetchPolicy on the call
      const result = await wrapper.vm.mutate(
        { input: { name: 'Override', email: 'override@example.com' } },
        { fetchPolicy: 'no-cache' },
      )

      expect(result?.data?.createUser.name).toBe('Override')

      wrapper.unmount()
    })

    it('error ref is null initially and populates on failure', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { mutate, error } = useMutation(FAILING_MUTATION, { throws: 'never' })
          return { mutate, error }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      expect(wrapper.vm.error).toBeNull()

      await wrapper.vm.mutate({ message: 'boom' })
      await nextTick()

      expect(wrapper.vm.error).not.toBeNull()
      expect(wrapper.vm.error?.message).toBeTruthy()

      wrapper.unmount()
    })

    it('mutate resolves to null when throws: never swallows an error', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { mutate } = useMutation(FAILING_MUTATION, { throws: 'never' })
          return { mutate }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      const result = await wrapper.vm.mutate({ message: 'boom' })

      expect(result).toBeNull()

      wrapper.unmount()
    })

    it('onDone fires with v4 { data } shape and { client } context', async () => {
      let seen: { data: unknown, client: ApolloClient | null } | null = null

      const TestComponent = defineComponent({
        setup() {
          const { mutate, onDone } = useMutation(CREATE_USER)
          onDone((result, ctx) => {
            seen = { data: result.data, client: ctx.client }
          })
          return { mutate }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await wrapper.vm.mutate({ input: { name: 'Done', email: 'done@example.com' } })
      await nextTick()

      expect(seen).not.toBeNull()
      expect(seen!.client).toBe(apolloClient)
      expect((seen!.data as { createUser: { name: string } }).createUser.name).toBe('Done')

      wrapper.unmount()
    })
  })
  // #endregion

  // #region useLazyQuery
  describe('useLazyQuery', () => {
    it('does not run until load() is called', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { result, loading, load } = useLazyQuery(HELLO_QUERY)
          return { result, loading, load }
        },
        render() {
          return h('div', this.result?.hello ?? 'not-loaded')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      await nextTick()
      expect(wrapper.text()).toBe('not-loaded')
      expect(wrapper.vm.loading).toBe(false)

      const promise = wrapper.vm.load()
      expect(promise).not.toBe(false)
      if (promise === false)
        throw new Error('first call should return a Promise')
      const data = await promise
      expect(data?.hello).toBe('world')
      expect(wrapper.text()).toBe('world')

      wrapper.unmount()
    })

    it('load(undefined, variables) accepts the v4 3-arg signature', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { result, load } = useLazyQuery(ECHO_QUERY)
          return { result, load }
        },
        render() {
          return h('div', this.result?.echo ?? 'not-loaded')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      const first = await wrapper.vm.load(undefined, { message: 'alpha' })
      expect(first === false).toBe(false)
      if (first === false)
        throw new Error('first call should return a Promise')
      expect(first?.echo).toBe('alpha')

      wrapper.unmount()
    })

    it('load resolves when errorPolicy ignores a result-state error', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { load } = useLazyQuery(
            NULLABLE_ERROR_QUERY,
            { shouldError: true },
            { errorPolicy: 'ignore' },
          )
          return { load }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      const first = wrapper.vm.load()
      expect(first).not.toBe(false)
      if (first === false)
        throw new Error('first call should return a Promise')

      await expect(withTimeout(first)).resolves.toEqual({ nullableError: null })

      wrapper.unmount()
    })

    it('load does not reject result-state errors that v4 delivered through onResult', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { load } = useLazyQuery(
            NULLABLE_ERROR_QUERY,
            { shouldError: true },
            { errorPolicy: 'all' },
          )
          return { load }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      const first = wrapper.vm.load()
      expect(first).not.toBe(false)
      if (first === false)
        throw new Error('first call should return a Promise')

      await expect(withTimeout(first)).resolves.toEqual({ nullableError: null })

      wrapper.unmount()
    })

    it('returns false on subsequent load() calls (v4 semantic)', async () => {
      const TestComponent = defineComponent({
        setup() {
          const { load } = useLazyQuery(HELLO_QUERY)
          return { load }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      const first = await wrapper.vm.load()
      expect(first).not.toBe(false)

      const second = wrapper.vm.load()
      expect(second).toBe(false)

      wrapper.unmount()
    })
  })
  // #endregion

  // #region useSubscription
  describe('useSubscription', () => {
    it('runs a subscription with the v4 1-arg signature', async () => {
      const received: number[] = []

      const TestComponent = defineComponent({
        setup() {
          const { result, loading, onResult } = useSubscription(COUNTER_SUBSCRIPTION)
          onResult((payload) => {
            if (payload.data?.counter != null) {
              received.push(payload.data.counter)
            }
          })
          return { result, loading }
        },
        render() {
          return h('div', 'test')
        },
      })

      const wrapper = mount(TestComponent, {
        global: { provide: { [DefaultApolloClient]: apolloClient } },
      })

      // Trigger the subscription via mutation
      await new Promise(resolve => setTimeout(resolve, 50))
      await apolloClient.mutate({ mutation: INCREMENT_COUNTER })

      await until(() => received.length >= 1).toBe(true, { timeout: 500 })
      expect(received.length).toBeGreaterThanOrEqual(1)

      wrapper.unmount()
    })
  })
  // #endregion
})
