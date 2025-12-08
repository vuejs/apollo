import type {
  ApolloClient,
  DefaultContext,
  DocumentNode,
  ErrorLike,
  ErrorPolicy,
  FetchPolicy,
  MaybeMasked,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import type { EventHookOn } from '@vueuse/core'
import type { Subscription } from 'rxjs'
import { computed, getCurrentScope, onScopeDispose, ref, shallowRef, toRef, toValue } from '@vue/reactivity'
import { nextTick, watch } from '@vue/runtime-core'
import { createEventHook, useDebounceFn, useThrottleFn } from '@vueuse/core'
import { equal } from '@wry/equality'
import { useApolloClient } from './useApolloClient.ts'
import { trackSubscription } from './util/loadingTracking.ts'

// #region Types
export declare namespace useSubscription {
  // Self-import to avoid shadowing in nested namespaces
  import _self = useSubscription

  /**
   * Type for the `variables` option parameter: either a ref/getter of the full variables object,
   * or an object mapping individual variable names to refs/getters.
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
    /** Options for useSubscription. */
    export interface Options<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
    > {
      /**
       * How you want your component to interact with the Apollo cache.
       *
       * @group 3. Caching options
       */
      fetchPolicy?: FetchPolicy

      /**
       * Specifies the `ErrorPolicy` to be used for this operation.
       *
       * @group 1. Operation options
       */
      errorPolicy?: ErrorPolicy

      /**
       * Shared context between your component and your network interface (Apollo Link).
       *
       * @group 2. Networking options
       */
      context?: DefaultContext

      /**
       * Extensions to be passed to the subscription.
       *
       * @group 2. Networking options
       */
      extensions?: Record<string, unknown>

      /**
       * Determines if your subscription should be unsubscribed and subscribed again
       * when an input to the hook (such as `subscription` or `variables`) changes.
       *
       * @default true
       * @group 4. Vue-Apollo
       */
      shouldResubscribe?: boolean | ((options: _self.Options<TData, TVariables>) => boolean)

      /**
       * ID of a named Apollo client to use instead of the default.
       *
       * @group 4. Vue-Apollo
       */
      clientId?: string

      /**
       * Reactive flag to enable/disable the subscription.
       *
       * @group 4. Vue-Apollo
       */
      enabled?: MaybeRefOrGetter<boolean>

      /**
       * Throttle variable updates (ms).
       *
       * @group 4. Vue-Apollo
       */
      throttle?: number

      /**
       * Debounce variable updates (ms).
       *
       * @group 4. Vue-Apollo
       */
      debounce?: number
    }

    /** Result returned by useSubscription. */
    export interface Result<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
    > {
      /**
       * An object containing the result of your GraphQL subscription.
       * Defaults to `undefined`.
       *
       * @group 1. Operation data
       */
      result: Readonly<Ref<MaybeMasked<TData> | undefined>>

      /**
       * A runtime error with `graphQLErrors` and `networkError` properties.
       *
       * @group 1. Operation data
       */
      error: Readonly<Ref<ErrorLike | undefined>>

      /**
       * A boolean that indicates whether any initial data has been returned.
       * `true` until the first subscription event is received.
       *
       * @group 2. Network info
       */
      loading: Readonly<Ref<boolean>>

      /**
       * Start the subscription. Has no effect if already active or `enabled` is false.
       *
       * @group 3. Lifecycle
       */
      start: () => void

      /**
       * Stop the subscription. Can be restarted by calling {@link start}.
       *
       * @group 3. Lifecycle
       */
      stop: () => void

      /**
       * Disconnect and reconnect the subscription.
       *
       * @group 3. Lifecycle
       */
      restart: () => Promise<void>

      /**
       * Event triggered when subscription data is received.
       *
       * @group 4. Events
       */
      onResult: EventHookOn<MaybeMasked<TData>>

      /**
       * Event triggered when a subscription error occurs.
       *
       * @group 4. Events
       */
      onError: EventHookOn<ErrorLike>

      /**
       * Event triggered when the subscription completes.
       *
       * @group 4. Events
       */
      onComplete: EventHookOn<void>

      /**
       * The GraphQL document being subscribed to.
       *
       * @group 5. Refs
       */
      document: Readonly<Ref<DocumentNode>>

      /**
       * Current variables being sent to the subscription (after debounce/throttle).
       *
       * @group 5. Refs
       */
      variables: Readonly<Ref<TVariables>>

      /**
       * Current options.
       *
       * @group 5. Refs
       */
      options: Readonly<Ref<_self.Options<TData, TVariables> | undefined>>
    }
  }

  export type Options<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Base.Options<TData, TVariables> & ReactiveVariablesOption<TVariables>

  /** Options when subscription is explicitly disabled. Variables are optional. */
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

  /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result:interface} */
  export interface Result<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > extends Base.Result<TData, TVariables> {}

  export namespace DocumentationTypes {
    /** @group Composables Namespaces */
    namespace useSubscription {
      /** {@inheritDoc @vue/apollo-composable!useSubscription.ReactiveVariablesParameter:type} */
      export type ReactiveVariablesParameter
        = | MaybeRefOrGetter<OperationVariables>
          | Record<string, MaybeRefOrGetter<unknown>>

      /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options:interface} */
      export interface Options {
        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#fetchPolicy:member} */
        fetchPolicy?: FetchPolicy

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#errorPolicy:member} */
        errorPolicy?: ErrorPolicy

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#context:member} */
        context?: DefaultContext

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#extensions:member} */
        extensions?: Record<string, unknown>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#shouldResubscribe:member} */
        shouldResubscribe?: boolean | ((options: Options) => boolean)

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#clientId:member} */
        clientId?: string

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#enabled:member} */
        enabled?: MaybeRefOrGetter<boolean>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#throttle:member} */
        throttle?: number

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Options#debounce:member} */
        debounce?: number

        /**
         * An object containing all of the GraphQL variables your subscription requires to execute.
         *
         * @group 1. Operation options
         */
        variables?: ReactiveVariablesParameter
      }

      /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result:interface} */
      export interface Result {
        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#result:member} */
        result: Ref<object | undefined>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#error:member} */
        error: Ref<ErrorLike | undefined>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#loading:member} */
        loading: Ref<boolean>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#start:member} */
        start: () => void

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#stop:member} */
        stop: () => void

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#restart:member} */
        restart: () => Promise<void>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#onResult:member} */
        onResult: EventHookOn<object>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#onError:member} */
        onError: EventHookOn<ErrorLike>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#onComplete:member} */
        onComplete: EventHookOn<void>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#document:member} */
        document: Ref<DocumentNode>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#variables:member} */
        variables: Ref<OperationVariables>

        /** {@inheritDoc @vue/apollo-composable!useSubscription.Base.Result#options:member} */
        options: Ref<Options | undefined>
      }
    }

    /** {@inheritDoc @vue/apollo-composable!useSubscription:function(1)} */
    export function useSubscription(
      subscription: MaybeRefOrGetter<DocumentNode>,
      options?: MaybeRefOrGetter<useSubscription.Options>,
    ): useSubscription.Result
  }
}
// #endregion

// #region Implementation
/**
 * A composable for executing GraphQL subscriptions with full reactivity.
 *
 * @param subscription - A GraphQL subscription document.
 * @param options - Options to control how the subscription is executed.
 * @returns Subscription result object with reactive refs.
 *
 * @group Composables
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useSubscription } from '@vue/apollo-composable'
 * import gql from 'graphql-tag'
 *
 * const OnMessage = gql`subscription OnMessage($channelId: ID!) {
 *   newMessage(channelId: $channelId) { id text author }
 * }`
 *
 * const { result, error, onResult, onError } = useSubscription(OnMessage, {
 *   variables: { channelId: '1' }
 * })
 *
 * onResult((data) => {
 *   console.log('New message:', data)
 * })
 *
 * onError((error) => {
 *   console.error('Subscription error:', error.message)
 * })
 * </script>
 *
 * <template>
 *   <div v-if="error">
 *     Error: {{ error.message }}
 *   </div>
 *   <div v-else>
 *     Last result: {{ result }}
 *   </div>
 * </template>
 * ```
 */
export function useSubscription<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  subscription: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options?: MaybeRefOrGetter<useSubscription.MaybeDisabledOptions<TData, TVariables>>,
): useSubscription.Result<TData, TVariables> {
  const currentScope = getCurrentScope()

  // #region Input Normalization
  const document = toRef(subscription)
  const optionsRef = toRef(options) as Ref<useSubscription.Options<TData, TVariables> | undefined>
  // #endregion

  // #region Apollo Client
  const { resolveClient } = useApolloClient()

  function getClient() {
    return resolveClient(optionsRef.value?.clientId)
  }
  // #endregion

  // #region Enabled State
  /** Internal flag to force-disable the subscription */
  const forceDisabled = ref(false)
  /** User-provided enabled option, defaults to true */
  const enabledOption = computed(() => toValue(optionsRef.value?.enabled) ?? true)
  /** Final computed enabled state */
  const isEnabled = computed(() => enabledOption.value && !forceDisabled.value && !!document.value)
  // #endregion

  // #region Variables
  /**
   * Resolves variables from either a single ref/getter or an object of individual refs.
   * Unwraps all nested reactive values.
   */
  const variables = computed(() => {
    const vars = toValue(optionsRef.value?.variables)

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
  }, () => optionsRef.value?.debounce ?? 0)

  const setThrottledVariables = useThrottleFn((newVariables: TVariables) => {
    currentVariables.value = newVariables
  }, () => optionsRef.value?.throttle ?? 0)

  /** Sync variables changes to currentVariables, applying debounce/throttle if configured */
  watch(variables, (newVariables) => {
    if (optionsRef.value?.debounce != null) {
      setDebouncedVariables(newVariables)
    }
    else if (optionsRef.value?.throttle != null) {
      setThrottledVariables(newVariables)
    }
    else {
      currentVariables.value = newVariables
    }
  })
  // #endregion

  // #region Core State
  const result = shallowRef<MaybeMasked<TData> | undefined>(undefined)
  const error = shallowRef<ErrorLike | undefined>(undefined)
  const loading = ref(true)
  const rxSubscription = shallowRef<Subscription>()

  // Track loading state for useSubscriptionLoading/useGlobalSubscriptionLoading
  trackSubscription(loading)
  // #endregion

  // #region Events
  const resultEvent = createEventHook<unknown>()
  const errorEvent = createEventHook<ErrorLike>()
  const completeEvent = createEventHook<void>()
  // #endregion

  // #region Subscription Options
  /** Previous options used to determine if resubscription is needed */
  let previousOptions: {
    query: DocumentNode
    variables: TVariables
    fetchPolicy?: FetchPolicy | undefined
    errorPolicy?: ErrorPolicy | undefined
    context?: DefaultContext | undefined
    extensions?: Record<string, unknown> | undefined
  } | null = null

  /** Build Apollo subscription options */
  function buildSubscriptionOptions(): ApolloClient.SubscribeOptions<TData, TVariables> {
    return {
      query: document.value,
      variables: currentVariables.value,
      fetchPolicy: optionsRef.value?.fetchPolicy,
      errorPolicy: optionsRef.value?.errorPolicy,
      context: optionsRef.value?.context,
      extensions: optionsRef.value?.extensions,
    } as ApolloClient.SubscribeOptions<TData, TVariables>
  }

  /** Check if we should resubscribe based on option changes */
  function shouldResubscribe(newOptions: ReturnType<typeof buildSubscriptionOptions>): boolean {
    if (!previousOptions)
      return true

    const optionsChanged = (
      previousOptions.query !== newOptions.query
      || !equal(previousOptions.variables, newOptions.variables)
      || previousOptions.fetchPolicy !== newOptions.fetchPolicy
      || previousOptions.errorPolicy !== newOptions.errorPolicy
      || !equal(previousOptions.context, newOptions.context)
      || !equal(previousOptions.extensions, newOptions.extensions)
    )

    if (!optionsChanged)
      return false

    const shouldResubscribeOption = optionsRef.value?.shouldResubscribe ?? true
    if (typeof shouldResubscribeOption === 'function') {
      return shouldResubscribeOption(optionsRef.value as useSubscription.Options<TData, TVariables>)
    }
    return shouldResubscribeOption
  }
  // #endregion

  // #region Subscription Management
  function subscribe() {
    const client = getClient()
    const subscriptionOptions = buildSubscriptionOptions()

    // Store for comparison
    previousOptions = {
      query: subscriptionOptions.query,
      variables: subscriptionOptions.variables as TVariables,
      fetchPolicy: subscriptionOptions.fetchPolicy,
      errorPolicy: subscriptionOptions.errorPolicy,
      context: subscriptionOptions.context,
      extensions: subscriptionOptions.extensions,
    }

    // Reset state
    loading.value = true
    error.value = undefined

    const observable = client.subscribe<TData, TVariables>(subscriptionOptions)

    rxSubscription.value = observable.subscribe({
      next: (subscriptionResult) => {
        loading.value = false
        result.value = subscriptionResult.data
        error.value = subscriptionResult.error

        if (subscriptionResult.error) {
          errorEvent.trigger(subscriptionResult.error)
        }
        else if (subscriptionResult.data) {
          resultEvent.trigger(subscriptionResult.data)
        }
      },
      error: (subscriptionError: ErrorLike) => {
        loading.value = false
        error.value = subscriptionError
        errorEvent.trigger(subscriptionError)
      },
      complete: () => {
        loading.value = false
        completeEvent.trigger()
      },
    })
  }

  function unsubscribe() {
    rxSubscription.value?.unsubscribe()
    rxSubscription.value = undefined
  }
  // #endregion

  // #region Watchers
  /** Create or destroy subscription based on enabled state */
  watch(isEnabled, (newIsEnabled) => {
    if (newIsEnabled) {
      subscribe()
    }
    else {
      unsubscribe()
      loading.value = false
    }
  }, { immediate: true, flush: 'sync' })

  /** React to option changes - resubscribe if needed */
  watch([document, currentVariables, () => optionsRef.value?.fetchPolicy, () => optionsRef.value?.errorPolicy], () => {
    if (!isEnabled.value || !rxSubscription.value)
      return

    const newOptions = buildSubscriptionOptions()
    if (shouldResubscribe(newOptions)) {
      unsubscribe()
      subscribe()
    }
  })
  // #endregion

  // #region Cleanup
  if (currentScope) {
    onScopeDispose(() => {
      unsubscribe()
    })
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
    if (!isEnabled.value)
      return

    forceDisabled.value = true
    await nextTick()
    forceDisabled.value = false
  }

  return {
    result,
    error,
    loading,

    start,
    stop,
    restart,

    onResult: resultEvent.on as EventHookOn<MaybeMasked<TData>>,
    onError: errorEvent.on,
    onComplete: completeEvent.on,

    document,
    variables: currentVariables as Ref<TVariables>,
    options: optionsRef,
  }
  // #endregion
}
// #endregion
