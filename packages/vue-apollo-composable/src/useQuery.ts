import {
  ref,
  Ref,
  unref,
  computed,
  watch,
  onServerPrefetch,
  getCurrentInstance,
  onBeforeUnmount,
  nextTick,
} from 'vue-demi'
import { DocumentNode } from 'graphql'
import {
  OperationVariables,
  WatchQueryOptions,
  ObservableQuery,
  ApolloQueryResult,
  SubscribeToMoreOptions,
  FetchMoreQueryOptions,
  FetchMoreOptions,
  ObservableSubscription,
  TypedDocumentNode,
  ApolloError,
} from '@apollo/client/core'
import { throttle, debounce } from 'throttle-debounce'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
import { useEventHook } from './util/useEventHook'
import { trackQuery } from './util/loadingTracking'
import { resultErrorsToApolloError, toApolloError } from './util/toApolloError'
import { isServer } from './util/env'

import type { CurrentInstance } from './util/types'

export interface UseQueryOptions<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TResult = any,
  TVariables = OperationVariables
> extends Omit<WatchQueryOptions<TVariables>, 'query' | 'variables'> {
  clientId?: string
  enabled?: boolean
  throttle?: number
  debounce?: number
  prefetch?: boolean
}

interface SubscribeToMoreItem {
  options: any
  unsubscribeFns: (() => void)[]
}

// Parameters
export type DocumentParameter<TResult, TVariables = undefined> = DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode> | TypedDocumentNode<TResult, TVariables> | Ref<TypedDocumentNode<TResult, TVariables>> | ReactiveFunction<TypedDocumentNode<TResult, TVariables>>
export type VariablesParameter<TVariables> = TVariables | Ref<TVariables> | ReactiveFunction<TVariables>
export type OptionsParameter<TResult, TVariables> = UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>> | ReactiveFunction<UseQueryOptions<TResult, TVariables>>

// Return
export interface UseQueryReturn<TResult, TVariables> {
  result: Ref<TResult | undefined>
  loading: Ref<boolean>
  networkStatus: Ref<number | undefined>
  error: Ref<ApolloError | null>
  start: () => void
  stop: () => void
  restart: () => void
  forceDisabled: Ref<boolean>
  document: Ref<DocumentNode>
  variables: Ref<TVariables | undefined>
  options: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>>
  query: Ref<ObservableQuery<TResult, TVariables> | null | undefined>
  refetch: (variables?: TVariables) => Promise<ApolloQueryResult<TResult>> | undefined
  fetchMore: (options: FetchMoreQueryOptions<TVariables, TResult> & FetchMoreOptions<TResult, TVariables>) => Promise<ApolloQueryResult<TResult>> | undefined
  subscribeToMore: <TSubscriptionVariables = OperationVariables, TSubscriptionData = TResult>(options: SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData> | Ref<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>> | ReactiveFunction<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>>) => void
  onResult: (fn: (param: ApolloQueryResult<TResult>) => void) => {
    off: () => void
  }
  onError: (fn: (param: ApolloError) => void) => {
    off: () => void
  }
}

/**
 * Use a query that does not require variables or options.
 * */
export function useQuery<TResult = any> (
  document: DocumentParameter<TResult, undefined>
): UseQueryReturn<TResult, undefined>

/**
 * Use a query that has optional variables but not options
 */
export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables> (
  document: DocumentParameter<TResult, TVariables>
): UseQueryReturn<TResult, TVariables>

/**
 * Use a query that has required variables but not options
 */
export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables> (
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>
): UseQueryReturn<TResult, TVariables>

/**
 * Use a query that requires options but not variables.
 */
export function useQuery<TResult = any> (
  document: DocumentParameter<TResult, undefined>,
  variables: undefined | null,
  options: OptionsParameter<TResult, null>,
): UseQueryReturn<TResult, null>

/**
 * Use a query that requires variables and options.
 */
export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables> (
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>,
  options: OptionsParameter<TResult, TVariables>,
): UseQueryReturn<TResult, TVariables>

export function useQuery<
  TResult,
  TVariables extends OperationVariables
> (
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables>,
  options?: OptionsParameter<TResult, TVariables>,
): UseQueryReturn<TResult, TVariables> {
  return useQueryImpl<TResult, TVariables>(document, variables, options)
}

export function useQueryImpl<
  TResult,
  TVariables extends OperationVariables
> (
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables>,
  options: OptionsParameter<TResult, TVariables> = {},
  lazy = false,
): UseQueryReturn<TResult, TVariables> {
  // Is on server?
  const vm = getCurrentInstance() as CurrentInstance | null

  const currentOptions = ref<UseQueryOptions<TResult, TVariables>>()

  const documentRef = paramToRef(document)
  const variablesRef = paramToRef(variables)
  const optionsRef = paramToReactive(options)

  // Result
  /**
   * Result from the query
   */
  const result = ref<TResult | undefined>()
  const resultEvent = useEventHook<ApolloQueryResult<TResult>>()
  const error = ref<ApolloError | null>(null)
  const errorEvent = useEventHook<ApolloError>()

  // Loading

  /**
   * Indicates if a network request is pending
   */
  const loading = ref(false)
  vm && trackQuery(loading)
  const networkStatus = ref<number>()

  // SSR
  let firstResolve: (() => void) | undefined
  let firstReject: ((apolloError: ApolloError) => void) | undefined
  vm && onServerPrefetch?.(() => {
    if (!isEnabled.value || (isServer && currentOptions.value?.prefetch === false)) return

    return new Promise<void>((resolve, reject) => {
      firstResolve = () => {
        resolve()
        firstResolve = undefined
        firstReject = undefined
      }
      firstReject = (apolloError: ApolloError) => {
        reject(apolloError)
        firstResolve = undefined
        firstReject = undefined
      }
    }).then(stop).catch(stop)
  })

  // Apollo Client
  const { resolveClient } = useApolloClient()

  // Query

  const query: Ref<ObservableQuery<TResult, TVariables> | null | undefined> = ref()
  let observer: ObservableSubscription | undefined
  let started = false
  let ignoreNextResult = false

  /**
   * Starts watching the query
   */
  function start () {
    if (
      started || !isEnabled.value ||
      (isServer && currentOptions.value?.prefetch === false)
    ) {
      if (firstResolve) firstResolve()
      return
    }

    started = true
    error.value = null
    loading.value = true

    const client = resolveClient(currentOptions.value?.clientId)

    query.value = client.watchQuery<TResult, TVariables>({
      query: currentDocument,
      variables: currentVariables,
      ...currentOptions.value,
      ...(isServer && currentOptions.value?.fetchPolicy !== 'no-cache')
        ? {
          fetchPolicy: 'network-only',
        }
        : {},
    })

    startQuerySubscription()

    // Make the cache data available to the component immediately
    // This prevents SSR hydration mismatches
    if (!isServer && (currentOptions.value?.fetchPolicy !== 'no-cache' || currentOptions.value.notifyOnNetworkStatusChange)) {
      const currentResult = query.value.getCurrentResult(false)

      if (!currentResult.loading || currentResult.partial || currentOptions.value?.notifyOnNetworkStatusChange) {
        onNextResult(currentResult)
        ignoreNextResult = !currentResult.loading
      } else if (currentResult.error) {
        onError(currentResult.error)
        ignoreNextResult = true
      }
    }

    if (!isServer) {
      for (const item of subscribeToMoreItems) {
        addSubscribeToMore(item)
      }
    }
  }

  function startQuerySubscription () {
    if (observer && !observer.closed) return
    if (!query.value) return

    // Create subscription
    ignoreNextResult = false
    observer = query.value.subscribe({
      next: onNextResult,
      error: onError,
    })
  }

  function onNextResult (queryResult: ApolloQueryResult<TResult>) {
    if (ignoreNextResult) {
      ignoreNextResult = false
      return
    }

    // Remove any previous error that may still be present from the last fetch (so result handlers
    // don't receive old errors that may not even be applicable anymore).
    error.value = null

    processNextResult(queryResult)

    // When `errorPolicy` is `all`, `onError` will not get called and
    // ApolloQueryResult.errors may be set at the same time as we get a result
    if (!queryResult.error && queryResult.errors?.length) {
      processError(resultErrorsToApolloError(queryResult.errors))
    }

    if (firstResolve) {
      firstResolve()
      stop()
    }
  }

  function processNextResult (queryResult: ApolloQueryResult<TResult>) {
    result.value = queryResult.data && Object.keys(queryResult.data).length === 0 ? undefined : queryResult.data
    loading.value = queryResult.loading
    networkStatus.value = queryResult.networkStatus
    resultEvent.trigger(queryResult)
  }

  function onError (queryError: unknown) {
    if (ignoreNextResult) {
      ignoreNextResult = false
      return
    }

    // any error should already be an ApolloError, but we make sure
    const apolloError = toApolloError(queryError)
    const client = resolveClient(currentOptions.value?.clientId)
    const errorPolicy = currentOptions.value?.errorPolicy || client.defaultOptions?.watchQuery?.errorPolicy

    if (errorPolicy && errorPolicy !== 'none') {
      processNextResult((query.value as ObservableQuery<TResult, TVariables>).getCurrentResult())
    }
    processError(apolloError)
    if (firstReject) {
      firstReject(apolloError)
      stop()
    }
    // The observable closes the sub if an error occurs
    resubscribeToQuery()
  }

  function processError (apolloError: ApolloError) {
    error.value = apolloError
    loading.value = false
    networkStatus.value = 8
    errorEvent.trigger(apolloError)
  }

  function resubscribeToQuery () {
    if (!query.value) return
    const lastError = query.value.getLastError()
    const lastResult = query.value.getLastResult()
    query.value.resetLastResults()
    startQuerySubscription()
    Object.assign(query.value, { lastError, lastResult })
  }

  let onStopHandlers: Array<() => void> = []

  /**
   * Stop watching the query
   */
  function stop () {
    if (firstResolve) firstResolve()
    if (!started) return
    started = false
    loading.value = false

    onStopHandlers.forEach(handler => handler())
    onStopHandlers = []

    if (query.value) {
      query.value.stopPolling()
      query.value = null
    }

    if (observer) {
      observer.unsubscribe()
      observer = undefined
    }
  }

  // Restart
  let restarting = false
  /**
   * Queue a restart of the query (on next tick) if it is already active
   */
  function baseRestart () {
    if (!started || restarting) return
    restarting = true
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    nextTick(() => {
      if (started) {
        stop()
        start()
      }
      restarting = false
    })
  }

  let debouncedRestart: typeof baseRestart
  let isRestartDebounceSetup = false
  function updateRestartFn () {
    // On server, will be called before currentOptions is initialized
    // @TODO investigate
    if (!currentOptions.value) {
      debouncedRestart = baseRestart
    } else {
      if (currentOptions.value?.throttle) {
        debouncedRestart = throttle(currentOptions.value.throttle, baseRestart)
      } else if (currentOptions.value?.debounce) {
        debouncedRestart = debounce(currentOptions.value.debounce, baseRestart)
      } else {
        debouncedRestart = baseRestart
      }
      isRestartDebounceSetup = true
    }
  }

  function restart () {
    if (!isRestartDebounceSetup) updateRestartFn()
    debouncedRestart()
  }

  // Applying document
  let currentDocument: DocumentNode
  watch(documentRef, value => {
    currentDocument = value
    restart()
  }, {
    immediate: true,
  })

  // Applying variables
  let currentVariables: TVariables | undefined
  let currentVariablesSerialized: string
  watch(variablesRef, (value, oldValue) => {
    const serialized = JSON.stringify(value)
    if (serialized !== currentVariablesSerialized) {
      currentVariables = value
      restart()
    }
    currentVariablesSerialized = serialized
  }, {
    deep: true,
    immediate: true,
  })

  // Applying options
  watch(() => unref(optionsRef), value => {
    if (currentOptions.value && (
      currentOptions.value.throttle !== value.throttle ||
      currentOptions.value.debounce !== value.debounce
    )) {
      updateRestartFn()
    }
    currentOptions.value = value
    restart()
  }, {
    deep: true,
    immediate: true,
  })

  // Refetch

  function refetch (variables: TVariables | undefined = undefined) {
    if (query.value) {
      if (variables) {
        currentVariables = variables
      }
      error.value = null
      loading.value = true
      return query.value.refetch(variables)
        .then((refetchResult) => {
          const currentResult = query.value?.getCurrentResult()
          currentResult && processNextResult(currentResult)
          return refetchResult
        })
    }
  }

  // Fetch more

  function fetchMore (options: FetchMoreQueryOptions<TVariables, TResult> & FetchMoreOptions<TResult, TVariables>) {
    if (query.value) {
      error.value = null
      loading.value = true
      return query.value.fetchMore(options)
        .then((fetchMoreResult) => {
          const currentResult = query.value?.getCurrentResult()
          currentResult && processNextResult(currentResult)
          return fetchMoreResult
        })
    }
  }

  // Subscribe to more

  const subscribeToMoreItems: SubscribeToMoreItem[] = []

  function subscribeToMore<
    TSubscriptionVariables = OperationVariables,
    TSubscriptionData = TResult
  > (
    options: SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData> |
    Ref<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>> |
    ReactiveFunction<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>>,
  ) {
    if (isServer) return
    const optionsRef = paramToRef(options)
    watch(optionsRef, (value, oldValue, onCleanup) => {
      const index = subscribeToMoreItems.findIndex(item => item.options === oldValue)
      if (index !== -1) {
        subscribeToMoreItems.splice(index, 1)
      }
      const item: SubscribeToMoreItem = {
        options: value,
        unsubscribeFns: [],
      }
      subscribeToMoreItems.push(item)

      addSubscribeToMore(item)

      onCleanup(() => {
        item.unsubscribeFns.forEach(fn => fn())
        item.unsubscribeFns = []
      })
    }, {
      immediate: true,
    })
  }

  function addSubscribeToMore (item: SubscribeToMoreItem) {
    if (!started) return
    if (!query.value) {
      throw new Error('Query is not defined')
    }
    const unsubscribe = query.value.subscribeToMore(item.options)
    onStopHandlers.push(unsubscribe)
    item.unsubscribeFns.push(unsubscribe)
  }

  // Enabled state

  const forceDisabled = ref(lazy)
  const enabledOption = computed(() => !currentOptions.value || currentOptions.value.enabled == null || currentOptions.value.enabled)
  const isEnabled = computed(() => enabledOption.value && !forceDisabled.value)

  // Auto start & stop
  watch(isEnabled, value => {
    if (value) {
      start()
    } else {
      stop()
    }
  }, {
    immediate: true,
  })

  // Teardown
  vm && onBeforeUnmount(() => {
    stop()
    subscribeToMoreItems.length = 0
  })

  return {
    result,
    loading,
    networkStatus,
    error,
    start,
    stop,
    restart,
    forceDisabled,
    document: documentRef,
    variables: variablesRef,
    options: optionsRef,
    query,
    refetch,
    fetchMore,
    subscribeToMore,
    onResult: resultEvent.on,
    onError: errorEvent.on,
  }
}
