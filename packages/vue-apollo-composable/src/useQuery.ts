import type {
  ApolloClient,
  DataState,
  DefaultContext,
  DocumentNode,
  ErrorLike,
  ErrorPolicy,
  MaybeMasked,
  ObservableQuery,
  OperationVariables,
  TypedDocumentNode,
  UpdateQueryMapFn,
} from '@apollo/client'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import type { EventHookOn } from '@vueuse/core'
import type { Subscription } from 'rxjs'
import type { RenameKey } from './util/types.ts'
import { NetworkStatus } from '@apollo/client'
import { computed, getCurrentScope, onScopeDispose, ref, shallowRef, toRef, toValue } from '@vue/reactivity'
import { getCurrentInstance, nextTick, onServerPrefetch, watch } from '@vue/runtime-core'
import { createEventHook, useDebounceFn, useThrottleFn } from '@vueuse/core'
import { equal } from '@wry/equality'
import { useApolloClient } from './useApolloClient.ts'
import { trackQuery } from './util/loadingTracking.ts'

// #region Types
export declare namespace useQuery {
  // Self-import to avoid shadowing in nested namespaces
  import _self = useQuery

  /**
   * Type for the `variables` option parameter: either a ref/getter of the full variables object,
   * or an object mapping individual variable names to refs/getters.
   *
   * @example
   * ```ts
   * // Single ref/getter for all variables
   * const variables = reactive({ id: 1 })
   * useQuery(query, { variables })
   *
   * // Object mapping individual variable names to refs/getters
   * const id = ref(1)
   * useQuery(query, { variables: { id } })
   *
   * // With props or any reactive values
   * const { id } = defineProps<{ id: number }>()
   * useQuery(query, { variables: () => ({ id }) })
   * ```
   */
  export type ReactiveVariablesParameter<TVariables extends OperationVariables> = MaybeRefOrGetter<TVariables> | {
    [Key in keyof TVariables]: MaybeRefOrGetter<TVariables[Key]>
  }

  /** Makes `variables` required only when TVariables has required properties. */
  export type ReactiveVariablesOption<TVariables extends OperationVariables> = {} extends TVariables ? {
    variables?: ReactiveVariablesParameter<TVariables>
  } : {
    variables: ReactiveVariablesParameter<TVariables>
  }

  export namespace Base {
    /** Apollo's WatchQueryOptions without `query` and `variables` (handled separately). */
    export type WatchQueryOptions<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
    > = Omit<ApolloClient.WatchQueryOptions<TData, TVariables>, 'variables' | 'query'>

    /** Vue-Apollo specific options. */
    export interface VueApolloOptions {
      /**
       * ID of a named Apollo client to use instead of the default.
       *
       * @group 4. Vue-Apollo
       */
      clientId?: string | undefined

      /**
       * Reactive flag to enable/disable the query.
       *
       * @group 4. Vue-Apollo
       */
      enabled?: MaybeRefOrGetter<boolean | undefined>

      /**
       * Throttle variable updates (ms).
       *
       * @group 4. Vue-Apollo
       */
      throttle?: number | undefined

      /**
       * Debounce variable updates (ms).
       *
       * @group 4. Vue-Apollo
       */
      debounce?: number | undefined

      /**
       * Whether to prefetch on server.
       *
       * @defaultValue true
       * @group 4. Vue-Apollo
       */
      prefetch?: boolean | undefined

      /**
       * Keep previous result while loading new data.
       *
       * @defaultValue false
       * @group 4. Vue-Apollo
       */
      keepPreviousResult?: boolean | undefined

      /**
       * Whether to await complete data before resolving. Use with `@stream` and `@defer` GraphQL directives.
       *
       * Only affects SSR prefetch and `await useQuery()`.
       *
       * @default false
       * @group 4. Vue-Apollo
       */
      awaitComplete?: boolean | undefined
    }

    /** Options for useQuery. */
    export interface Options<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
    > extends VueApolloOptions {
      /**
       * Specifies how the query interacts with the Apollo Client cache during execution (for example, whether it checks the cache for results before sending a request to the server).
       *
       * For details, see [Setting a fetch policy](https://www.apollographql.com/docs/react/data/queries/#setting-a-fetch-policy).
       *
       * The default value is `cache-first`.
       *
       * @group 3. Caching options
       */
      fetchPolicy?: ApolloClient.WatchQueryOptions<TData, TVariables>['fetchPolicy'] | undefined

      /**
       * Specifies the `FetchPolicy` to be used after this query has completed.
       *
       * @group 3. Caching options
       */
      nextFetchPolicy?: ApolloClient.WatchQueryOptions<TData, TVariables>['nextFetchPolicy'] | undefined

      /**
       * Defaults to the initial value of options.fetchPolicy, but can be explicitly
       * configured to specify the WatchQueryFetchPolicy to revert back to whenever
       * variables change (unless nextFetchPolicy intervenes).
       *
       * @group 3. Caching options
       */
      initialFetchPolicy?: ApolloClient.WatchQueryOptions<TData, TVariables>['initialFetchPolicy'] | undefined

      /**
       * Specifies whether a `NetworkStatus.refetch` operation should merge
       * incoming field data with existing data, or overwrite the existing data.
       * Overwriting is probably preferable, but merging is currently the default
       * behavior, for backwards compatibility with Apollo Client 3.x.
       *
       * @group 3. Caching options
       */
      refetchWritePolicy?: ApolloClient.WatchQueryOptions<TData, TVariables>['refetchWritePolicy'] | undefined

      /**
       * Specifies how the query handles a response that returns both GraphQL errors and partial results.
       *
       * For details, see [GraphQL error policies](https://www.apollographql.com/docs/react/data/error-handling/#graphql-error-policies).
       *
       * The default value is `none`, meaning that the query result includes error details but not partial results.
       *
       * @group 1. Operation options
       */
      errorPolicy?: ApolloClient.WatchQueryOptions<TData, TVariables>['errorPolicy'] | undefined

      /**
       * If `true`, the query can return partial results from the cache if the cache doesn't contain results for all queried fields.
       *
       * @default false
       * @group 3. Caching options
       */
      returnPartialData?: ApolloClient.WatchQueryOptions<TData, TVariables>['returnPartialData'] | undefined

      /**
       * If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.
       *
       * @group 2. Networking options
       */
      context?: ApolloClient.WatchQueryOptions<TData, TVariables>['context'] | undefined

      /**
       * Specifies the interval (in milliseconds) at which the query polls for updated results.
       *
       * @default 0 // (no polling)
       *
       * @group 2. Networking options
       */
      pollInterval?: ApolloClient.WatchQueryOptions<TData, TVariables>['pollInterval'] | undefined

      /**
       * If `true`, the next state event is emitted whenever the network status changes or a network error occurs.
       *
       * @group 2. Networking options
       */
      notifyOnNetworkStatusChange?: ApolloClient.WatchQueryOptions<TData, TVariables>['notifyOnNetworkStatusChange'] | undefined

      /**
       * A callback function that's called whenever a refetch attempt occurs
       * while polling. If the function returns `true`, the refetch is
       * skipped and not reattempted until the next poll interval.
       *
       * @group 2. Networking options
       */
      skipPollAttempt?: ApolloClient.WatchQueryOptions<TData, TVariables>['skipPollAttempt'] | undefined
    }
  }

  export type Options<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Base.Options<TData, TVariables> & ReactiveVariablesOption<TVariables>

  /** Options when query is explicitly disabled. Variables are optional. */
  export type DisabledOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Base.Options<TData, TVariables> & {
    enabled: MaybeRefOrGetter<false>
    variables?: ReactiveVariablesParameter<TVariables>
  }

  /** Options that can reactively switch between enabled and disabled. */
  export type MaybeDisabledOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Options<TData, TVariables> | DisabledOptions<TData, TVariables>

  /** Query result with Vue-Apollo naming: `result`/`resultState` instead of `data`/`dataState`. */
  export type Current<
    TData,
    TStates extends DataState<TData>['dataState'] = DataState<TData>['dataState'],
  > = RenameKey<RenameKey<ObservableQuery.Result<TData, TStates>, 'dataState', 'resultState'>, 'data', 'result'>

  /** FetchMore result with Vue-Apollo naming: `result` instead of `data`. */
  export type FetchMoreResult<TData> = RenameKey<ApolloClient.QueryResult<MaybeMasked<TData>>, 'data', 'result'>

  export namespace Base {
    /** Result returned by useQuery. */
    export interface Result<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
    > {

      /**
       * If `true`, the query is still in flight.
       *
       * @group 2. Network info
       */
      loading: Readonly<Ref<boolean>>

      /**
       * A number indicating the current network state of the query's associated request. [See possible values.](https://github.com/apollographql/apollo-client/blob/d96f4578f89b933c281bb775a39503f6cdb59ee8/src/core/networkStatus.ts#L4)
       *
       * Used in conjunction with the [`notifyOnNetworkStatusChange`](./Options.md#notifyonnetworkstatuschange) option.
       *
       * @group 2. Network info
       */
      networkStatus: Readonly<Ref<NetworkStatus>>

      /**
       * A single ErrorLike object describing the error that occurred during the latest
       * query execution.
       *
       * For more information, see [Handling operation errors](https://www.apollographql.com/docs/react/data/error-handling/).
       *
       * @group 1. Operation data
       */
      error: Readonly<Ref<ErrorLike | undefined>>

      /**
       * Event triggered when query result data is received.
       *
       * Fires when `resultState` is `'complete'`, `'partial'`, or `'streaming'`.
       * Does not fire for `'empty'` state or errors.
       *
       * @group 6. Events
       */
      onResult: EventHookOn<MaybeMasked<TData>>

      /**
       * Event triggered when a complete query result is received.
       *
       * Fires only when `resultState` is `'complete'`.
       *
       * @group 6. Events
       */
      onCompleteResult: EventHookOn<MaybeMasked<TData>>

      /**
       * Event triggered when a partial query result is received.
       *
       * Fires only when `resultState` is `'partial'`. Requires `returnPartialData: true`.
       *
       * @group 6. Events
       */
      onPartialResult: EventHookOn<MaybeMasked<TData>>

      /**
       * Event triggered when streaming query data is received.
       *
       * Fires only when `resultState` is `'streaming'`. Use with `@defer` or `@stream` directive.
       *
       * @group 6. Events
       */
      onStreamingResult: EventHookOn<MaybeMasked<TData>>

      /**
       * Event triggered when a query error occurs.
       *
       * @group 6. Events
       */
      onError: EventHookOn<ErrorLike>

      /**
       * Start the query. Has no effect if the query is already active or if `enabled` option is `false`.
       *
       * @group 4. Lifecycle
       */
      start: () => void

      /**
       * Stop the query. The query can be restarted by calling {@link start}.
       *
       * @group 4. Lifecycle
       */
      stop: () => void

      /**
       * Stop and restart the query.
       *
       * @group 4. Lifecycle
       */
      restart: () => Promise<void>

      /**
       * Re-execute the query, optionally with new variables.
       *
       * Use this for imperative refetching (e.g., "refresh" buttons, pull-to-refresh).
       * The reactive `current`, `result`, `loading`, etc. refs will update automatically
       * when the refetch completes.
       *
       * ::: tip When to use refetch vs reactive variables
       *
       * - Use **reactive `variables`** in options for variables that should stay in sync
       *   with your component state (e.g., route params, form inputs).
       * - Use **`refetch()`** for one-time imperative fetches that don't need to persist.
       *
       * :::
       *
       * ::: warning Variables passed to refetch are temporary
       *
       * If you pass variables to `refetch({ id: 2 })`, Apollo uses them for this single
       * request only. The exposed `variables` ref will **not** update. If your reactive
       * `options.variables` changes later, the query will use those values, not the ones
       * passed to refetch.
       *
       * :::
       *
       * @param variables - Optional variables to use for this refetch only.
       * @returns Promise resolving to the query result, or `undefined` if query is stopped.
       *
       * @example
       * ```ts
       * const { refetch } = useQuery(GetUser, { variables: { id: userId } })
       *
       * // Re-run with current variables
       * await refetch()
       *
       * // One-time refetch with different variables
       * await refetch({ id: 'other-user' })
       * ```
       *
       * @group 5. Query methods
       */
      refetch: (variables?: TVariables) => Promise<RenameKey<ApolloClient.QueryResult<TData>, 'data', 'result'> | undefined>

      /**
       * Fetch more data for pagination or infinite scroll.
       *
       * Use this to load additional items (e.g., next page) and merge them with existing results.
       * The reactive refs will update automatically when the fetch completes.
       *
       * ::: tip How data is merged
       *
       * You can merge data in two ways:
       *
       * 1. **`updateQuery` callback** - Manually merge `fetchMoreResult` with `previousQueryResult`
       *
       * 2. **Field policies** - Define `merge` functions in your Apollo cache configuration
       *
       * If using `fetchPolicy: 'no-cache'`, you **must** provide `updateQuery`.
       *
       * :::
       *
       * @param options - Options including variables for the next page and optional updateQuery.
       * @returns Promise resolving to the fetchMore result, or `undefined` if query is stopped.
       *
       * @example
       * ```ts
       * const { result, fetchMore } = useQuery(GetPosts, {
       *   variables: { offset: 0, limit: 10 }
       * })
       *
       * async function loadMore() {
       *   await fetchMore({
       *     variables: { offset: result.value.posts.length },
       *     updateQuery: (previousQueryResult, { fetchMoreResult }) => ({
       *       ...previousQueryResult,
       *       posts: [...previousQueryResult.posts, ...fetchMoreResult.posts]
       *     })
       *   })
       * }
       * ```
       *
       * @group 5. Query methods
       */
      fetchMore: <
        TFetchData = TData,
        TFetchVars extends OperationVariables = TVariables,
      >(
        options: ObservableQuery.FetchMoreOptions<TData, TVariables, TFetchData, TFetchVars>,
      ) => Promise<_self.FetchMoreResult<TFetchData>> | undefined

      /**
       * Directly update the cached query result.
       *
       * Use this to optimistically update the cache or modify data without a network request.
       * The reactive refs will update automatically when the cache is written.
       *
       * ::: warning Use sparingly
       *
       * Prefer cache field policies or [`client.writeQuery`](https://www.apollographql.com/docs/react/api/core/ApolloClient#writequery) for most cache updates.
       * `updateQuery` is useful for quick local modifications but bypasses
       * Apollo's normal cache update mechanisms.
       *
       * :::
       *
       * @param mapFn - Function that receives current data and returns new data.
       *
       * @example
       * ```ts
       * const { updateQuery } = useQuery(GetTodos)
       *
       * function addOptimisticTodo(todo: Todo) {
       *   updateQuery((_, { previousData }) => ({
       *     ...previousData,
       *     todos: [...previousData.todos, todo]
       *   }))
       * }
       * ```
       *
       * @group 5. Query methods
       */
      updateQuery: (mapFn: UpdateQueryMapFn<TData, TVariables>) => void

      /**
       * Subscribe to additional data and merge it with the query result.
       *
       * Use this to add real-time updates to a query via GraphQL subscriptions.
       * When subscription data arrives, the `updateQuery` callback merges it
       * with the existing query data.
       *
       * ::: tip Automatic cleanup
       *
       * The subscription is automatically cleaned up when the query is stopped
       * or the component is unmounted. You can also manually unsubscribe by
       * calling the returned function.
       *
       * :::
       *
       * @param options - Subscription options including document, variables, and updateQuery.
       * @returns Unsubscribe function to manually stop the subscription.
       *
       * @example
       * ```ts
       * const { subscribeToMore } = useQuery(GetMessages, {
       *   variables: { channelId }
       * })
       *
       * // Subscribe to new messages
       * const unsubscribe = subscribeToMore({
       *   document: OnMessageAdded,
       *   variables: { channelId },
       *   updateQuery: (_, { previousData, subscriptionData }) => {
       *     if (!subscriptionData.data) return previousData
       *     return {
       *       ...previousData,
       *       messages: [...previousData.messages, subscriptionData.data.messageAdded]
       *     }
       *   }
       * })
       *
       * // Optionally unsubscribe manually
       * onUnmounted(() => unsubscribe())
       * ```
       *
       * @group 5. Query methods
       */
      subscribeToMore: <
        TSubscriptionData = TData,
        TSubscriptionVariables extends OperationVariables = TVariables,
      >(
        options: ObservableQuery.SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData, TVariables>,
      ) => (() => void) | undefined

      /**
       * The GraphQL document being queried.
       *
       * @group 3. Refs
       */
      document: Readonly<Ref<DocumentNode>>

      /**
       * Current variables being sent to the query (after debounce/throttle).
       *
       * @group 3. Refs
       */
      variables: Readonly<Ref<TVariables>>

      /**
       * Current options.
       *
       * @group 3. Refs
       */
      options: Readonly<Ref<_self.Options<TData, TVariables>>>

      /**
       * The underlying Apollo ObservableQuery instance. Undefined when the query is stopped.
       *
       * @group 3. Refs
       */
      query: Readonly<Ref<ObservableQuery<TData, TVariables> | undefined>>
    }
  }

  export interface Result<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TStates extends DataState<TData>['dataState'] = DataState<TData>['dataState'],
  > extends Omit<Base.Result<TData, TVariables>, 'current' | 'result' | 'onNextState'> {
    /**
     * Current state as a discriminated union type.
     *
     * @group 1. Operation data
     */
    current: Readonly<Ref<Current<MaybeMasked<TData>, TStates>>>

    /**
     * An object containing the result of your GraphQL query after it completes.
     *
     * This value might be `undefined` if a query results in one or more errors (depending on the query's `errorPolicy`).
     *
     * @group 1. Operation data
     */
    result: Readonly<Ref<Current<MaybeMasked<TData>, TStates>['result']>>

    /**
     * Event triggered when the query state changes.
     *
     * This is the most granular event - it fires on every state update including
     * loading states, network status changes, and result updates.
     *
     * @group 6. Events
     */
    onNextState: EventHookOn<Current<MaybeMasked<TData>, TStates>>
  }

  export namespace DocumentationTypes {
    /** @group Composables Namespaces */
    namespace useQuery {
      /** {@inheritDoc @vue/apollo-composable!useQuery.ReactiveVariablesParameter:type} */
      export type ReactiveVariablesParameter
        = | MaybeRefOrGetter<OperationVariables>
          | Record<string, MaybeRefOrGetter<any>>

      /** Current state. */
      export interface Current {
        /**
         * An object containing the result of your GraphQL query after it completes.
         *
         * This value might be `undefined` if a query results in one or more errors (depending on the query's `errorPolicy`).
         *
         * @group 1. Operation data
         */
        result: object | null | undefined

        /**
         * Describes the completeness of `result`.
         *
         * - `empty`: No data could be fulfilled from the cache or the result is
         *   incomplete. `result` is `undefined`.
         * - `partial`: Some data could be fulfilled from the cache but `result` is
         *   incomplete. This is only possible when `returnPartialData` is `true`.
         * - `streaming`: `result` is incomplete as a result of a deferred query and
         *   the result is still streaming in.
         * - `complete`: `result` is a fully satisfied query result fulfilled
         *   either from the cache or network.
         *
         * @group 1. Operation data
         */
        resultState: 'empty' | 'complete' | 'streaming' | 'partial'

        /**
         * If `true`, the query is still in flight.
         *
         * @group 2. Network info
         */
        loading: boolean

        /**
         * A number indicating the current network state of the query's associated request. [See possible values.](https://github.com/apollographql/apollo-client/blob/d96f4578f89b933c281bb775a39503f6cdb59ee8/src/core/networkStatus.ts#L4)
         *
         * Used in conjunction with the [`notifyOnNetworkStatusChange`](./Options.md#notifyonnetworkstatuschange) option.
         *
         * @group 2. Network info
         */
        networkStatus: NetworkStatus

        /**
         * A single ErrorLike object describing the error that occurred during the latest
         * query execution.
         *
         * For more information, see [Handling operation errors](https://www.apollographql.com/docs/react/data/error-handling/).
         *
         * @group 1. Operation data
         */
        error?: ErrorLike

        /**
         * Describes whether `result` is a complete or partial result. This flag is only
         * set when `returnPartialData` is `true` in query options.
         *
         * @deprecated This field will be removed in a future version of Apollo Client.
         * @group 1. Operation data
         */
        partial: boolean
      }

      /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Options:interface} */
      export interface Options extends _self.Base.Options {
        /**
         * An object containing all of the GraphQL variables your query requires to execute.
         *
         * Each key in the object corresponds to a variable name, and that key's value corresponds to the variable value.
         *
         * @group 1. Operation options
         */
        variables?: ReactiveVariablesParameter
      }

      /** FetchMore result with Vue-Apollo naming. */
      export interface FetchMoreResult {
        /**
         * An object containing the result of your GraphQL query after it completes.
         *
         * This value might be `undefined` if a query results in one or more errors (depending on the query's `errorPolicy`).
         *
         * @group 1. Operation data
         */
        result: object | null | undefined

        /**
         * A single ErrorLike object describing the error that occurred during the latest
         * query execution.
         *
         * For more information, see [Handling operation errors](https://www.apollographql.com/docs/react/data/error-handling/).
         *
         * @group 1. Operation data
         */
        error?: ErrorLike
      }

      /**
       * Options for fetchMore.
       */
      interface FetchMoreOptions {
        /**
         * A GraphQL query string parsed into an AST with the gql template literal.
         *
         * @group 1. Operation options
         */
        query?: DocumentNode
        /**
         * An object containing all of the GraphQL variables your query requires to execute.
         *
         * Each key in the object corresponds to a variable name, and that key's value corresponds to the variable value.
         *
         * @group 1. Operation options
         */
        variables?: OperationVariables
        /**
         * Specifies how the query handles a response that returns both GraphQL errors and partial results.
         *
         * For details, see [GraphQL error policies](https://www.apollographql.com/docs/react/data/error-handling/#graphql-error-policies).
         *
         * The default value is `none`, meaning that the query result includes error details but not partial results.
         *
         * @group 1. Operation options
         */
        errorPolicy?: ErrorPolicy
        /**
         * If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.
         *
         * @group 2. Networking options
         */
        context?: DefaultContext
        /**
         * A function which updates the query result with the new fetchMore result.
         *
         * @group 3. Query methods
         */
        updateQuery?: (previousQueryResult: object, options: { fetchMoreResult: object, variables: object }) => object
      }

      /**
       * Options for subscribeToMore.
       */
      interface SubscribeToMoreOptions {
        /**
         * A GraphQL subscription document parsed into an AST with the gql template literal.
         *
         * @group 1. Operation options
         */
        document: DocumentNode
        /**
         * An object containing all of the GraphQL variables your subscription requires to execute.
         *
         * @group 1. Operation options
         */
        variables?: OperationVariables
        /**
         * A function that defines how incoming subscription data is merged with the existing query data.
         *
         * ::: warning First argument is deprecated
         *
         * The first argument (`unsafePreviousData`) is not type-safe and may contain partial data.
         * It will be removed in Apollo Client v5. Use `options.previousData` instead.
         *
         * :::
         *
         * @group 3. Query methods
         */
        updateQuery?: (unsafePreviousData: object, options: { subscriptionData: { data: object }, previousData: object }) => object
        /**
         * A callback function that's called when the subscription encounters an error.
         *
         * @group 3. Query methods
         */
        onError?: (error: Error) => void
        /**
         * If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.
         *
         * @group 2. Networking options
         */
        context?: DefaultContext
      }

      /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result:interface} */
      export interface Result extends Omit<_self.Base.Result, 'current' | 'result' | 'onNextState' | 'onResult' | 'onCompleteResult' | 'onPartialResult' | 'onStreamingResult' | 'document' | 'variables' | 'options' | 'query' | 'fetchMore' | 'updateQuery' | 'subscribeToMore'> {
        /** {@inheritDoc @vue/apollo-composable!useQuery.Result#current:member} */
        current: Ref<Current>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Result#result:member} */
        result: Ref<object | null>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#error:member} */
        error: Ref<ErrorLike | undefined>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#loading:member} */
        loading: Ref<boolean>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#networkStatus:member} */
        networkStatus: Ref<NetworkStatus>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Result#onNextState:member} */
        onNextState: EventHookOn<Current>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#onResult:member} */
        onResult: EventHookOn<object>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#onCompleteResult:member} */
        onCompleteResult: EventHookOn<object>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#onPartialResult:member} */
        onPartialResult: EventHookOn<object>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#onStreamingResult:member} */
        onStreamingResult: EventHookOn<object>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#document:member} */
        document: Ref<DocumentNode>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#variables:member} */
        variables: Ref<OperationVariables>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#options:member} */
        options: Ref<Options>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#query:member} */
        query: Ref<ObservableQuery | undefined>

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#fetchMore:member} */
        fetchMore: (options: FetchMoreOptions) => Promise<FetchMoreResult> | undefined

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#updateQuery:member} */
        updateQuery: (mapFn: (unsafePreviousData: object, options: { previousData: object }) => object) => void

        /** {@inheritDoc @vue/apollo-composable!useQuery.Base.Result#subscribeToMore:member} */
        subscribeToMore: (options: SubscribeToMoreOptions) => (() => void) | undefined
      }
    }

    /** {@inheritDoc @vue/apollo-composable!useQuery:function(1)} */
    export function useQuery(
      query: MaybeRefOrGetter<DocumentNode>,
      options?: MaybeRefOrGetter<useQuery.Options>,
    ): useQuery.Result & PromiseLike<useQuery.Result>
  }
}
// #endregion

// #region Helpers
/**
 * Determines if the observable query needs to be completely re-created vs just updated.
 * Copy-pasted from Apollo Client's useQuery implementation.
 */
function shouldReobserve<TData, TVariables extends OperationVariables>(
  previousOptions: Readonly<ApolloClient.WatchQueryOptions<TData, TVariables>>,
  options: Readonly<ApolloClient.WatchQueryOptions<TData, TVariables>>,
) {
  return (
    previousOptions.query !== options.query
    || !equal(previousOptions.variables, options.variables)
    || (previousOptions.fetchPolicy !== options.fetchPolicy
      && (options.fetchPolicy === 'standby'
        || previousOptions.fetchPolicy === 'standby'))
  )
}

function toCurrent<
  TData,
  TStates extends
  DataState<TData>['dataState'] = DataState<TData>['dataState'],
>(result: ObservableQuery.Result<TData, TStates>): useQuery.Current<TData, TStates> {
  const { data, dataState, ...rest } = result

  return {
    result: data,
    resultState: dataState,
    ...rest,
  } as useQuery.Current<TData, TStates>
}

function toFetchMoreResult<TData>(result: ApolloClient.QueryResult<TData>): useQuery.FetchMoreResult<TData> {
  const { data, ...rest } = result
  return { result: data, ...rest } as useQuery.FetchMoreResult<TData>
}
// #endregion

export function useQueryImpl<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  sourceDocument: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, Record<keyof any, never>>>,
  sourceOptions?: MaybeRefOrGetter<useQuery.Options<TData, TVariables>>,
  /** When true, query starts disabled and must be manually enabled */
  lazy = false,
) {
  // #region Input Normalization
  const document = toRef(sourceDocument)
  const options = toRef(sourceOptions) as Ref<useQuery.Options<TData, TVariables> | undefined>
  // #endregion

  // #region Options Parsing
  /** Extract Apollo-specific watch query options */
  const watchQueryOptions = computed<useQuery.Base.WatchQueryOptions<TData, TVariables>>(() => {
    const {
      fetchPolicy,
      nextFetchPolicy,
      initialFetchPolicy,
      refetchWritePolicy,
      errorPolicy,
      context,
      pollInterval,
      notifyOnNetworkStatusChange,
      returnPartialData,
      skipPollAttempt,
    } = options.value ?? {}

    return {
      fetchPolicy,
      nextFetchPolicy,
      initialFetchPolicy,
      refetchWritePolicy,
      errorPolicy,
      context,
      pollInterval,
      notifyOnNetworkStatusChange,
      returnPartialData,
      skipPollAttempt,
    } as useQuery.Base.WatchQueryOptions<TData, TVariables>
  })

  /** Extract Vue-Apollo specific options */
  const vueApolloQueryOptions = computed<useQuery.Base.VueApolloOptions>(() => {
    const {
      clientId,
      enabled,
      throttle,
      debounce,
      prefetch,
      keepPreviousResult,
    } = options.value ?? {}

    return {
      clientId,
      enabled,
      throttle,
      debounce,
      prefetch,
      keepPreviousResult,
    } as useQuery.Base.VueApolloOptions
  })
  // #endregion

  // #region Apollo Client
  const { resolveClient } = useApolloClient()

  function getClient() {
    return resolveClient(vueApolloQueryOptions.value?.clientId)
  }
  // #endregion

  // #region Enabled State
  /** Internal flag to force-disable the query (used by lazy queries) */
  const forceDisabled = ref(lazy)
  /** User-provided enabled option, defaults to true */
  const enabledOption = computed(() => toValue(vueApolloQueryOptions.value?.enabled) ?? true)
  /** Final computed enabled state - must have document and not be disabled */
  const isEnabled = computed(() => enabledOption.value && !forceDisabled.value && !!document.value)
  // #endregion

  // #region Variables
  /**
   * Resolves variables from either a single ref/getter or an object of individual refs.
   * Unwraps all nested reactive values.
   */
  const variables = computed(() => {
    const vars = toValue(options.value?.variables)

    if (vars == null) {
      return {} as TVariables
    }

    const result = {} as Record<string, unknown>

    for (const [key, value] of Object.entries(vars)) {
      result[key] = toValue(value)
    }

    return result as TVariables
  })

  /** The actual variables sent to Apollo (may be delayed by debounce/throttle) */
  const currentVariables = shallowRef(variables.value)

  const setDebouncedVariables = useDebounceFn((newVariables: TVariables) => {
    currentVariables.value = newVariables
  }, () => vueApolloQueryOptions.value.debounce ?? 0)

  const setThrottledVariables = useThrottleFn(
    (newVariables: TVariables) => {
      currentVariables.value = newVariables
    },
    () => vueApolloQueryOptions.value.throttle ?? 0,
    true, // trailing edge
  )

  /** Sync variables changes to currentVariables, applying debounce/throttle if configured */
  watch(variables, (newVariables) => {
    if (vueApolloQueryOptions.value.debounce != null) {
      setDebouncedVariables(newVariables)
    }
    else if (vueApolloQueryOptions.value.throttle != null) {
      setThrottledVariables(newVariables)
    }
    else {
      currentVariables.value = newVariables
    }
  }, { flush: 'sync' })
  // #endregion

  // #region Core State
  const currentScope = getCurrentScope()
  const currentInstance = getCurrentInstance()

  const observableQuery = shallowRef<ObservableQuery<TData, TVariables>>()
  const subscription = shallowRef<Subscription>()

  const currentState = shallowRef<useQuery.Current<TData>>({
    result: undefined,
    loading: false,
    networkStatus: NetworkStatus.ready,
    resultState: 'empty',
    partial: false,
  })

  // Computed refs for public API - defined early so trackQuery can be called before query starts
  const result = computed(() => currentState.value.result)
  const loading = computed(() => currentState.value.loading)
  const networkStatus = computed(() => currentState.value.networkStatus)
  const error = computed(() => currentState.value.error)

  if (currentScope)
    trackQuery(loading)
  // #endregion

  // #region Events
  const nextStateEvent = createEventHook<useQuery.Current<TData>>()
  const resultEvent = createEventHook<unknown>()
  const completeResultEvent = createEventHook<unknown>()
  const partialResultEvent = createEventHook<unknown>()
  const streamingResultEvent = createEventHook<unknown>()
  const errorEvent = createEventHook<ErrorLike>()

  // Event handlers - trigger specific events based on state
  nextStateEvent.on((newState) => {
    // When keepPreviousResult is true and new state has no result,
    // preserve the previous result while still updating loading/networkStatus/resultState
    if (
      newState.resultState === 'empty'
      && vueApolloQueryOptions.value.keepPreviousResult
      && currentState.value.result != null
    ) {
      currentState.value = {
        ...newState,
        result: currentState.value.result,
      } as unknown as useQuery.Current<TData>
    }
    else {
      currentState.value = newState
    }

    // Trigger error event
    if (newState.error) {
      errorEvent.trigger(newState.error)
    }

    // Trigger result events based on resultState
    if (newState.resultState === 'complete') {
      completeResultEvent.trigger(newState.result)
      resultEvent.trigger(newState.result)
    }
    else if (newState.resultState === 'partial') {
      partialResultEvent.trigger(newState.result)
      resultEvent.trigger(newState.result)
    }
    else if (newState.resultState === 'streaming') {
      streamingResultEvent.trigger(newState.result)
      resultEvent.trigger(newState.result)
    }
  })
  // #endregion

  // #region Observable Query
  /** Combined options passed to Apollo's watchQuery */
  const apolloWatchQueryOptions = computed<ApolloClient.WatchQueryOptions<TData, TVariables>>(() => ({
    query: document.value,
    variables: currentVariables.value,
    ...watchQueryOptions.value,
  } as ApolloClient.WatchQueryOptions<TData, TVariables>))

  /** Handle observable query changes - cleanup old, setup new subscription */
  watch(
    observableQuery,
    (
      newObservableQuery,
      oldObservableQuery,
    ) => {
      if (oldObservableQuery) {
        oldObservableQuery.stop()
        subscription.value = undefined
      }

      if (newObservableQuery) {
        currentState.value = toCurrent(newObservableQuery.getCurrentResult())
        subscription.value = newObservableQuery.subscribe((newState) => {
          nextStateEvent.trigger(toCurrent(newState))
        })
      }
    },
    { flush: 'sync' },
  )

  /** Create or destroy observable query based on enabled state */
  watch(isEnabled, (newIsEnabled) => {
    if (newIsEnabled) {
      const client = getClient()
      observableQuery.value = client.watchQuery<TData, TVariables>(apolloWatchQueryOptions.value)
    }
    else {
      observableQuery.value = undefined
    }
  }, { immediate: true, flush: 'sync' })

  /** React to option changes - reobserve or apply new options as needed */
  watch(apolloWatchQueryOptions, (newOptions, oldOptions) => {
    if (observableQuery.value == null) {
      return
    }

    if (
      shouldReobserve(
        oldOptions as Readonly<ApolloClient.WatchQueryOptions<unknown, OperationVariables>>,
        newOptions as Readonly<ApolloClient.WatchQueryOptions<unknown, OperationVariables>>,
      )
    ) {
      observableQuery.value?.reobserve(newOptions)
    }
    else {
      observableQuery.value?.applyOptions(newOptions)
    }

    const newCurrent = toCurrent(observableQuery.value.getCurrentResult())
    if (newCurrent.resultState === 'empty' && !vueApolloQueryOptions.value.keepPreviousResult) {
      currentState.value = newCurrent
    }
  })
  // #endregion

  // #region Cleanup
  if (currentScope) {
    onScopeDispose(() => {
      subscription.value?.unsubscribe()
      observableQuery.value?.stop()
    })
  }
  else {
    console.warn('[Vue apollo] useQuery() is called outside of an active effect scope and the query will not be automatically stopped.')
  }
  // #endregion

  // #region Public API
  function start() {
    forceDisabled.value = false
  }

  function stop() {
    forceDisabled.value = true
  }

  async function restart() {
    if (!isEnabled.value) {
      return
    }

    forceDisabled.value = true
    await nextTick()
    forceDisabled.value = false
  }

  async function refetch(variables?: TVariables) {
    const res = await observableQuery.value?.refetch(variables)
    if (res == null)
      return undefined

    const { data, ...rest } = res
    return {
      result: data,
      ...rest,
    }
  }

  function fetchMore<
    TFetchData = TData,
    TFetchVars extends OperationVariables = TVariables,
  >(options: ObservableQuery.FetchMoreOptions<TData, TVariables, TFetchData, TFetchVars>) {
    return observableQuery.value?.fetchMore(options).then(toFetchMoreResult)
  }

  function updateQuery(mapFn: UpdateQueryMapFn<TData, TVariables>) {
    observableQuery.value?.updateQuery(mapFn)
  }

  function subscribeToMore<
    TSubscriptionData = TData,
    TSubscriptionVariables extends OperationVariables = TVariables,
  >(options: ObservableQuery.SubscribeToMoreOptions<TData, TSubscriptionVariables, TSubscriptionData, TVariables>) {
    return observableQuery.value?.subscribeToMore(options)
  }

  const response = {
    current: currentState,
    result,
    loading,
    networkStatus,
    error,

    document,
    variables: currentVariables,
    options,
    query: observableQuery,

    start,
    stop,
    restart,
    refetch,
    fetchMore,
    updateQuery,
    subscribeToMore,

    onNextState: nextStateEvent.on,
    onResult: resultEvent.on,
    onCompleteResult: completeResultEvent.on,
    onPartialResult: partialResultEvent.on,
    onStreamingResult: streamingResultEvent.on,
    onError: errorEvent.on,
  } as useQuery.Result<TData, TVariables>

  function then(
    onfulfilled?: ((value: useQuery.Result<TData, TVariables>) => void | PromiseLike<void>),
    onrejected?: ((reason: any) => void | PromiseLike<void>),
  ): PromiseLike<any> {
    if (
      vueApolloQueryOptions.value.awaitComplete
        ? currentState.value.resultState === 'complete'
        : currentState.value.resultState !== 'empty'
    ) {
      if (error.value) {
        return Promise.reject(error.value).then(onfulfilled, onrejected)
      }
      return Promise.resolve(response as useQuery.Result<TData, TVariables>).then(onfulfilled, onrejected)
    }

    return new Promise<useQuery.Result<TData, TVariables>>((resolve, reject) => {
      const stopWatch = watch(
        currentState,
        (newState) => {
          if (
            vueApolloQueryOptions.value.awaitComplete
              ? newState.resultState === 'complete'
              : newState.resultState !== 'empty'
          ) {
            stopWatch()
            if (newState.error) {
              reject(newState.error)
            }
            else {
              resolve(response as useQuery.Result<TData, TVariables>)
            }
          }
        },
        { flush: 'sync' },
      )
    }).then(onfulfilled, onrejected)
  }

  if (currentInstance) {
    onServerPrefetch(() => {
      if (
        (vueApolloQueryOptions.value.prefetch ?? true)
        && isEnabled.value
      ) {
        return { then }
      }

      return Promise.resolve()
    })
  }

  return {
    then,
    ...response,
  }
  // #endregion
}

// #region useQuery Overloads
/**
 * A composable for executing GraphQL queries with full reactivity.
 *
 * @param query - A GraphQL document.
 * @param options - Options to control how the query is executed.
 * @returns Query result object with reactive refs.
 *
 * @group Composables
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useQuery } from '@vue/apollo-composable'
 * import gql from 'graphql-tag'
 *
 * const GetUser = gql`query GetUser($id: ID!) { user(id: $id) { name } }`
 *
 * const { current } = useQuery(GetUser, {
 *   variables: { id: '1' }
 * })
 * </script>
 *
 * <template>
 *   <div v-if="current.loading">Loading...</div>
 *   <div v-else-if="current.error">Error: {{ error.message }}</div>
 *   <div v-else>{{ result }}</div>
 * </template>
 * ```
 */
export function useQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options: MaybeRefOrGetter<useQuery.Options<NoInfer<TData>, NoInfer<TVariables>> & {
    returnPartialData: true
  }>,
):
  & useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming' | 'partial'>
  & PromiseLike<useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming' | 'partial'>>

export function useQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options: MaybeRefOrGetter<useQuery.Options<NoInfer<TData>, NoInfer<TVariables>> & {
    returnPartialData: boolean
  }>,
):
  & useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming' | 'partial'>
  & PromiseLike<useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming' | 'partial'>>

export function useQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options: MaybeRefOrGetter<useQuery.MaybeDisabledOptions<NoInfer<TData>, NoInfer<TVariables>>>,
):
  & useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming'>
  & PromiseLike<useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming'>>

export function useQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  ...[options]: {} extends TVariables
    ? [options?: MaybeRefOrGetter<useQuery.Options<NoInfer<TData>, NoInfer<TVariables>>>]
    : [options: MaybeRefOrGetter<useQuery.Options<NoInfer<TData>, NoInfer<TVariables>>>]
):
  & useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming'>
  & PromiseLike<useQuery.Result<TData, TVariables, 'empty' | 'complete' | 'streaming'>>

/** Implementation */
export function useQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options?: MaybeRefOrGetter<useQuery.Options<TData, TVariables> | useQuery.MaybeDisabledOptions<TData, TVariables>>,
): useQuery.Result<TData, TVariables> & PromiseLike<useQuery.Result<TData, TVariables>> {
  return useQueryImpl<TData, TVariables>(query, options as any) as any
}
// #endregion
