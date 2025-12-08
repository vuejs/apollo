import type {
  ApolloClient,
  DefaultContext,
  DocumentNode,
  ErrorLike,
  ErrorPolicy,
  MaybeMasked,
  MutationFetchPolicy,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client'
import type { ApolloCache } from '@apollo/client/cache'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import type { EventHookOn } from '@vueuse/core'
import { computed, getCurrentScope, onScopeDispose, ref, shallowRef, toRef, toValue } from '@vue/reactivity'
import { nextTick } from '@vue/runtime-core'
import { createEventHook } from '@vueuse/core'
import { useApolloClient } from './useApolloClient.ts'
import { trackMutation } from './util/loadingTracking.ts'

// #region Types
export declare namespace useMutation {
  // Self-import to avoid shadowing in nested namespaces
  import _self = useMutation

  /**
   * Type for the `variables` option parameter: either a ref/getter of the full variables object,
   * or an object mapping individual variable names to refs/getters.
   *
   * @example
   * ```ts
   * // Single ref/getter for all variables
   * const variables = reactive({ text: 'Hello' })
   * useMutation(mutation, { variables })
   *
   * // Object mapping individual variable names to refs/getters
   * const text = ref('Hello')
   * useMutation(mutation, { variables: { text } })
   * ```
   */
  export type ReactiveVariablesParameter<TVariables extends OperationVariables> = MaybeRefOrGetter<TVariables> | {
    [Key in keyof TVariables]: MaybeRefOrGetter<TVariables[Key]>
  }

  export namespace Base {
    /** Options for useMutation. */
    export interface Options<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
      TCache extends ApolloCache = ApolloCache,
    > {
      /**
       * By providing either an object or a callback function that, when invoked after
       * a mutation, allows you to return optimistic data and optionally skip updates
       * via the `IGNORE` sentinel object, Apollo Client caches this temporary
       * (and potentially incorrect) response until the mutation completes, enabling
       * more responsive UI updates.
       *
       * @group 1. Operation options
       */
      optimisticResponse?: ApolloClient.MutateOptions<TData, TVariables, TCache>['optimisticResponse']

      /**
       * A `MutationQueryReducersMap`, which is map from query names to
       * mutation query reducers. Briefly, this map defines how to incorporate the
       * results of the mutation into the results of queries that are currently
       * being watched by your application.
       *
       * @group 3. Caching options
       */
      updateQueries?: ApolloClient.MutateOptions<TData, TVariables, TCache>['updateQueries']

      /**
       * An array (or a function that _returns_ an array) that specifies which queries
       * you want to refetch after the mutation occurs.
       *
       * Each array value can be either:
       *
       * - An object containing the `query` to execute, along with any `variables`
       *
       * - A string indicating the operation name of the query to refetch
       *
       * @group 3. Caching options
       */
      refetchQueries?: ApolloClient.MutateOptions<TData, TVariables, TCache>['refetchQueries']

      /**
       * If `true`, makes sure all queries included in `refetchQueries` are completed
       * before the mutation is considered complete.
       *
       * @default false
       * @group 3. Caching options
       */
      awaitRefetchQueries?: ApolloClient.MutateOptions<TData, TVariables, TCache>['awaitRefetchQueries']

      /**
       * A function used to update the Apollo Client cache after the mutation completes.
       *
       * @group 3. Caching options
       */
      update?: ApolloClient.MutateOptions<TData, TVariables, TCache>['update']

      /**
       * Optional callback for intercepting queries whose cache data has been updated
       * by the mutation, as well as any queries specified in the `refetchQueries: [...]`
       * list passed to `client.mutate`.
       *
       * Returning a `Promise` from `onQueryUpdated` will cause the final mutation
       * `Promise` to await the returned `Promise`. Returning `false` causes the
       * query to be ignored.
       *
       * @group 3. Caching options
       */
      onQueryUpdated?: ApolloClient.MutateOptions<TData, TVariables, TCache>['onQueryUpdated']

      /**
       * Specifies how the mutation handles a response that returns both GraphQL errors
       * and partial results.
       *
       * The default value is `none`, meaning that the mutation result includes error
       * details but _not_ partial results.
       *
       * @group 1. Operation options
       */
      errorPolicy?: ErrorPolicy

      /**
       * An object containing all of the GraphQL variables your mutation requires to execute.
       *
       * Each key in the object corresponds to a variable name, and that key's value corresponds to the variable value.
       *
       * Supports reactive variables - provide a ref, getter, or object with reactive properties.
       *
       * @group 1. Operation options
       */
      variables?: ReactiveVariablesParameter<TVariables>

      /**
       * If you're using [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction/), this object is the initial value of the `context` object that's passed along your link chain.
       *
       * @group 2. Networking options
       */
      context?: DefaultContext

      /**
       * Provide `no-cache` if the mutation's result should _not_ be written to the
       * Apollo Client cache.
       *
       * The default value is `network-only` (which means the result _is_ written to the cache).
       *
       * @group 3. Caching options
       */
      fetchPolicy?: MutationFetchPolicy

      /**
       * If `true`, keeps ROOT_MUTATION fields in the cache after mutation completes.
       * By default, Apollo Client clears these to avoid retaining sensitive data.
       *
       * @group 3. Caching options
       */
      keepRootFields?: ApolloClient.MutateOptions<TData, TVariables, TCache>['keepRootFields']

      /**
       * ID of a named Apollo client to use instead of the default.
       *
       * @group 4. Vue-Apollo
       */
      clientId?: string

      /**
       * Controls error throwing behavior.
       *
       * - `'auto'` (default): Throws if no `onError` handler is registered
       *
       * - `'always'`: Always throws errors
       *
       * - `'never'`: Never throws errors
       *
       * @default 'auto'
       * @group 4. Vue-Apollo
       */
      throws?: 'auto' | 'always' | 'never'
    }

    /** Result returned by useMutation. */
    export interface Result<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
      TCache extends ApolloCache = ApolloCache,
    > {
      /**
       * Call the mutation with optional variables and override options.
       *
       * @param options - Variables and options for this mutation call.
       * @returns Promise resolving to the mutation result.
       *
       * @example
       * ```ts
       * const { mutate } = useMutation(AddTodo)
       *
       * // Call with variables
       * const result = await mutate({ variables: { text: 'New todo' } })
       *
       * // With optimistic response
       * await mutate({
       *   variables: { text: 'New todo' },
       *   optimisticResponse: {
       *     addTodo: { __typename: 'Todo', id: 'temp', text: 'New todo', completed: false }
       *   }
       * })
       * ```
       *
       * @group 1. Mutation
       */
      mutate: _self.MutateFunction<TData, TVariables, TCache>

      /**
       * The data returned from your mutation. Can be `undefined` if `errorPolicy`
       * is `all` or `ignore` and the server returns a GraphQL response with `errors`
       * but not `data`, or a network error is returned.
       *
       * @group 2. Operation data
       */
      result: Readonly<Ref<MaybeMasked<TData> | null | undefined>>

      /**
       * If the mutation produces one or more errors, this object contains either an
       * array of `graphQLErrors` or a single `networkError`. Otherwise, this value
       * is `undefined`.
       *
       * @group 2. Operation data
       */
      error: Readonly<Ref<ErrorLike | undefined>>

      /**
       * If `true`, the mutation is currently in flight.
       *
       * @group 3. Network info
       */
      loading: Readonly<Ref<boolean>>

      /**
       * If `true`, the mutation's mutate function has been called.
       *
       * @group 3. Network info
       */
      called: Readonly<Ref<boolean>>

      /**
       * Reset the mutation's result to its initial, uncalled state.
       *
       * @group 4. Lifecycle
       */
      reset: () => void

      /**
       * Event triggered when the mutation completes successfully.
       *
       * @group 5. Events
       */
      onDone: EventHookOn<ApolloClient.MutateResult<MaybeMasked<TData>>>

      /**
       * Event triggered when the mutation encounters an error.
       *
       * @group 5. Events
       */
      onError: EventHookOn<ErrorLike>

      /**
       * The GraphQL document being mutated.
       *
       * @group 6. Refs
       */
      document: Readonly<Ref<DocumentNode>>

      /**
       * Current options.
       *
       * @group 6. Refs
       */
      options: Readonly<Ref<_self.Options<TData, TVariables, TCache> | undefined>>
    }
  }

  /** Options for useMutation. */
  export type Options<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache,
  > = Base.Options<TData, TVariables, TCache>

  /** Options when calling the mutate function. */
  export type MutateOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache,
  > = Omit<Options<TData, TVariables, TCache>, 'clientId' | 'throws' | 'variables'> & {
    /**
     * Variables for this mutation call. Not reactive - pass plain values.
     *
     * @group 1. Operation options
     */
    variables?: TVariables

    /**
     * Context can be a callback function that receives the hook-level context
     * and returns the final context value.
     *
     * @group 2. Networking options
     */
    context?: DefaultContext | ((hookContext: DefaultContext | undefined) => DefaultContext)
  }

  /** Type for mutate function that requires variables. */
  export type MutateFunction<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache,
  > = {} extends TVariables
    ? (options?: MutateOptions<TData, TVariables, TCache>) => Promise<ApolloClient.MutateResult<MaybeMasked<TData>>>
    : (options: MutateOptions<TData, TVariables, TCache> & { variables: TVariables }) => Promise<ApolloClient.MutateResult<MaybeMasked<TData>>>

  /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result:interface} */
  export interface Result<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
    TCache extends ApolloCache = ApolloCache,
  > extends Base.Result<TData, TVariables, TCache> {}

  export namespace DocumentationTypes {
    /** @group Composables Namespaces */
    namespace useMutation {
      /** {@inheritDoc @vue/apollo-composable!useMutation.ReactiveVariablesParameter:type} */
      export type ReactiveVariablesParameter
        = | MaybeRefOrGetter<OperationVariables>
          | Record<string, MaybeRefOrGetter<any>>

      /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options:interface} */
      export interface Options {
        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#optimisticResponse:member} */
        optimisticResponse?: object | ((vars: object) => object)

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#updateQueries:member} */
        updateQueries?: Record<string, (prev: object, options: { mutationResult: object }) => object>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#refetchQueries:member} */
        refetchQueries?: Array<string | { query: DocumentNode, variables?: object }> | ((result: object) => Array<string | { query: DocumentNode, variables?: object }>)

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#awaitRefetchQueries:member} */
        awaitRefetchQueries?: boolean

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#update:member} */
        update?: (cache: ApolloCache, result: { data?: object }) => void

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#onQueryUpdated:member} */
        onQueryUpdated?: (observableQuery: object) => boolean | Promise<unknown>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#errorPolicy:member} */
        errorPolicy?: ErrorPolicy

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#variables:member} */
        variables?: ReactiveVariablesParameter

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#context:member} */
        context?: DefaultContext

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#fetchPolicy:member} */
        fetchPolicy?: MutationFetchPolicy

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#keepRootFields:member} */
        keepRootFields?: boolean

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#clientId:member} */
        clientId?: string

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Options#throws:member} */
        throws?: 'auto' | 'always' | 'never'
      }

      /** Options when calling the mutate function. */
      export interface MutateOptions extends Omit<Options, 'clientId' | 'throws' | 'variables'> {
        /**
         * Variables for this mutation call.
         *
         * @group 1. Operation options
         */
        variables?: OperationVariables

        /**
         * Context can be a callback or object.
         *
         * @group 2. Networking options
         */
        context?: DefaultContext | ((hookContext: DefaultContext | undefined) => DefaultContext)
      }

      /** Mutation result returned from mutate(). */
      export interface MutateResult {
        /** The mutation result data. */
        data: object | undefined

        /** Error if mutation failed. */
        error?: ErrorLike

        /** Custom extensions returned from the GraphQL server. */
        extensions?: Record<string, unknown>
      }

      /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result:interface} */
      export interface Result {
        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#mutate:member} */
        mutate: (options?: MutateOptions) => Promise<MutateResult>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#result:member} */
        result: Ref<object | null | undefined>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#error:member} */
        error: Ref<ErrorLike | undefined>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#loading:member} */
        loading: Ref<boolean>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#called:member} */
        called: Ref<boolean>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#reset:member} */
        reset: () => void

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#onDone:member} */
        onDone: EventHookOn<MutateResult>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#onError:member} */
        onError: EventHookOn<ErrorLike>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#document:member} */
        document: Ref<DocumentNode>

        /** {@inheritDoc @vue/apollo-composable!useMutation.Base.Result#options:member} */
        options: Ref<Options | undefined>
      }
    }

    /** {@inheritDoc @vue/apollo-composable!useMutation:function(1)} */
    export function useMutation(
      mutation: MaybeRefOrGetter<DocumentNode>,
      options?: MaybeRefOrGetter<useMutation.Options>,
    ): useMutation.Result
  }
}
// #endregion

// #region Implementation
/**
 * A composable for executing GraphQL mutations.
 *
 * @param mutation - A GraphQL mutation document.
 * @param options - Options to control how the mutation is executed.
 * @returns Mutation result object with reactive refs and mutate function.
 *
 * @group Composables
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useMutation } from '@vue/apollo-composable'
 * import gql from 'graphql-tag'
 *
 * const AddTodo = gql`mutation AddTodo($text: String!) { addTodo(text: $text) { id text } }`
 *
 * const { mutate, loading, error, onDone, onError } = useMutation(AddTodo)
 *
 * onDone((result) => {
 *   console.log('Todo added:', result.data)
 * })
 *
 * onError((error) => {
 *   console.error('Failed:', error.message)
 * })
 *
 * async function addTodo(text: string) {
 *   await mutate({ variables: { text } })
 * }
 * </script>
 *
 * <template>
 *   <button @click="addTodo('New task')" :disabled="loading">
 *     {{ loading ? 'Adding...' : 'Add Todo' }}
 *   </button>
 *   <p v-if="error">Error: {{ error.message }}</p>
 * </template>
 * ```
 */
export function useMutation<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
  TCache extends ApolloCache = ApolloCache,
>(
  mutation: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options?: MaybeRefOrGetter<useMutation.Options<TData, TVariables, TCache>>,
): useMutation.Result<TData, TVariables, TCache> {
  const currentScope = getCurrentScope()

  // #region Input Normalization
  const document = toRef(mutation)
  const hookOptions = toRef(options) as Ref<useMutation.Options<TData, TVariables, TCache> | undefined>
  // #endregion

  // #region Apollo Client
  const { resolveClient } = useApolloClient()

  function getClient() {
    return resolveClient(hookOptions.value?.clientId)
  }
  // #endregion

  // #region Variables
  /**
   * Resolves variables from either a single ref/getter or an object of individual refs.
   * Unwraps all nested reactive values.
   */
  const variables = computed(() => {
    const vars = toValue(hookOptions.value?.variables)

    if (vars == null) {
      return undefined
    }

    const result = {} as Record<string, unknown>

    for (const [key, value] of Object.entries(vars)) {
      result[key] = toValue(value)
    }

    return result as TVariables
  })
  // #endregion

  // #region Core State
  const result = shallowRef<MaybeMasked<TData> | null | undefined>(undefined)
  const error = shallowRef<ErrorLike | undefined>(undefined)
  const loading = ref(false)
  const called = ref(false)

  /** Mutation ID to handle stale responses from concurrent mutations */
  let mutationId = 0

  // Track loading state for useMutationLoading/useGlobalMutationLoading
  trackMutation(loading)
  // #endregion

  // #region Events
  const doneEvent = createEventHook<ApolloClient.MutateResult<MaybeMasked<TData>>>()
  const errorEvent = createEventHook<ErrorLike>()

  /** Track error listener count for auto-throw behavior */
  let errorListenerCount = 0

  function onError(fn: (error: ErrorLike) => void) {
    errorListenerCount++
    const { off } = errorEvent.on(fn)
    return {
      off: () => {
        errorListenerCount--
        off()
      },
    }
  }

  function hasErrorListeners(): boolean {
    return errorListenerCount > 0
  }
  // #endregion

  // #region Mutate Function
  async function mutate(
    executeOptions?: useMutation.MutateOptions<TData, TVariables, TCache>,
  ): Promise<ApolloClient.MutateResult<MaybeMasked<TData>>> {
    const client = getClient()
    const currentMutationId = ++mutationId

    // Get current hook options
    const currentHookOptions = hookOptions.value ?? {}

    // Extract non-Apollo options
    const { clientId: _clientId, throws: _throws, variables: _hookVars, ...apolloHookOptions } = currentHookOptions

    // Build merged options for Apollo
    const mergedOptions: ApolloClient.MutateOptions<TData, TVariables, TCache> = {
      mutation: document.value,
      ...apolloHookOptions,
      ...executeOptions,
      // Merge variables: hook variables (resolved) + execute variables
      variables: (executeOptions?.variables ?? variables.value)
        ? {
            ...(variables.value as TVariables),
            ...(executeOptions?.variables as TVariables),
          }
        : undefined,
      // Handle context callback
      context: typeof executeOptions?.context === 'function'
        ? executeOptions.context(currentHookOptions.context)
        : (executeOptions?.context ?? currentHookOptions.context),
    } as ApolloClient.MutateOptions<TData, TVariables, TCache>

    // Reset error and set loading
    error.value = undefined
    loading.value = true
    called.value = true

    try {
      const mutationResult = await client.mutate<TData, TVariables, TCache>(mergedOptions)

      // Ignore stale results from previous mutations
      if (currentMutationId !== mutationId) {
        return mutationResult
      }

      result.value = mutationResult.data
      loading.value = false

      // Wait for Vue to update before triggering events
      await nextTick()

      doneEvent.trigger(mutationResult)

      return mutationResult
    }
    catch (e) {
      // Ignore stale errors from previous mutations
      if (currentMutationId !== mutationId) {
        throw e
      }

      const mutationError = e as ErrorLike
      error.value = mutationError
      loading.value = false

      // Wait for Vue to update before triggering events
      await nextTick()

      errorEvent.trigger(mutationError)

      // Determine whether to throw
      const throwsBehavior = currentHookOptions.throws ?? 'auto'
      if (
        throwsBehavior === 'always'
        || (throwsBehavior === 'auto' && !hasErrorListeners())
      ) {
        throw mutationError
      }

      // Return a result with error for non-throwing case
      return {
        data: undefined,
        error: mutationError,
      }
    }
  }
  // #endregion

  // #region Reset
  function reset() {
    result.value = undefined
    error.value = undefined
    loading.value = false
    called.value = false
    mutationId = 0
  }
  // #endregion

  // #region Cleanup
  if (currentScope) {
    onScopeDispose(() => {
      loading.value = false
    })
  }
  // #endregion

  // #region Public API
  return {
    mutate: mutate as useMutation.MutateFunction<TData, TVariables, TCache>,
    result,
    error,
    loading,
    called,
    reset,
    onDone: doneEvent.on,
    onError,
    document,
    options: hookOptions,
  }
  // #endregion
}
// #endregion
