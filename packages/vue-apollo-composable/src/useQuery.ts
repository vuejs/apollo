import {
  ref,
  Ref,
  unref,
  computed,
  watch,
  onServerPrefetch,
  getCurrentScope,
  onScopeDispose,
  nextTick,
  shallowRef,
} from 'vue-demi'
import { DocumentNode } from 'graphql'
import type {
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
  ApolloClient,
} from '@apollo/client/core/index.js'
import { throttle, debounce } from 'throttle-debounce'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
import { useEventHook } from './util/useEventHook'
import { trackQuery } from './util/loadingTracking'
import { resultErrorsToApolloError, toApolloError } from './util/toApolloError'
import { isServer } from './util/env'

export interface UseQueryOptions<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TResult = any,
  TVariables extends OperationVariables = OperationVariables
> extends Omit<WatchQueryOptions<TVariables>, 'query' | 'variables'> {
  clientId?: string
  enabled?: boolean | Ref<boolean>
  throttle?: number
  debounce?: number
  prefetch?: boolean
  keepPreviousResult?: boolean
}

interface SubscribeToMoreItem {
  options: any
  unsubscribeFns: (() => void)[]
}

// Parameters
export type DocumentParameter<TResult, TVariables> = DocumentNode | Ref<DocumentNode | null | undefined> | ReactiveFunction<DocumentNode | null | undefined> | TypedDocumentNode<TResult, TVariables> | Ref<TypedDocumentNode<TResult, TVariables> | null | undefined> | ReactiveFunction<TypedDocumentNode<TResult, TVariables> | null | undefined>
export type VariablesParameter<TVariables> = TVariables | Ref<TVariables> | ReactiveFunction<TVariables>
export type OptionsParameter<TResult, TVariables extends OperationVariables> = UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>> | ReactiveFunction<UseQueryOptions<TResult, TVariables>>

export interface OnResultContext {
  client: ApolloClient<any>
}

export interface OnErrorContext {
  client: ApolloClient<any>
}

// Return
export interface UseQueryReturn<TResult, TVariables extends OperationVariables> {
  result: Ref<TResult | undefined>
  loading: Ref<boolean>
  networkStatus: Ref<number | undefined>
  error: Ref<ApolloError | null>
  start: () => void
  stop: () => void
  restart: () => void
  forceDisabled: Ref<boolean>
  document: Ref<DocumentNode | null | undefined>
  variables: Ref<TVariables | undefined>
  options: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>>
  query: Ref<ObservableQuery<TResult, TVariables> | null | undefined>
  refetch: (variables?: TVariables) => Promise<ApolloQueryResult<TResult>> | undefined
  fetchMore: (options: FetchMoreQueryOptions<TVariables, TResult> & FetchMoreOptions<TResult, TVariables>) => Promise<ApolloQueryResult<TResult>> | undefined
  subscribeToMore: <TSubscriptionVariables = OperationVariables, TSubscriptionData = TResult>(options: SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData> | Ref<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>> | ReactiveFunction<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>>) => void
  onResult: (fn: (param: ApolloQueryResult<TResult>, context: OnResultContext) => void) => {
    off: () => void
  }
  onError: (fn: (param: ApolloError, context: OnErrorContext) => void) => {
    off: () => void
  }
}

/**
 * Use a query that does not require variables or options.
 * */
export function useQuery<TResult = any> (
  document: DocumentParameter<TResult, undefined>
): UseQueryReturn<TResult, Record<string, never>>

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
  options: OptionsParameter<TResult, Record<string, never>>,
): UseQueryReturn<TResult, Record<string, never>>

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
  const currentScope = getCurrentScope()

  const currentOptions = ref<UseQueryOptions<TResult, TVariables>>()

  const documentRef = paramToRef(document)
  const variablesRef = paramToRef(variables)
  const optionsRef = paramToReactive(options)

  // Result
  /**
   * Result from the query
   */
  const result = shallowRef<TResult | undefined>()
  const resultEvent = useEventHook<[ApolloQueryResult<TResult>, OnResultContext]>()
  const error = shallowRef<ApolloError | null>(null)
  const errorEvent = useEventHook<[ApolloError, OnErrorContext]>()

  // Loading

  /**
   * Indicates if a network request is pending
   */
  const loading = ref(false)
  currentScope && trackQuery(loading)
  const networkStatus = ref<number>()

  // SSR
  let firstResolve: (() => void) | undefined
  let firstResolveTriggered = false
  let firstReject: ((apolloError: ApolloError) => void) | undefined
  let firstRejectError: undefined | ApolloError

  const tryFirstResolve = () => {
    firstResolveTriggered = true
    if (firstResolve) firstResolve()
  }

  const tryFirstReject = (apolloError: ApolloError) => {
    firstRejectError = apolloError
    if (firstReject) firstReject(apolloError)
  }

  const resetFirstResolveReject = () => {
    firstResolve = undefined
    firstReject = undefined
    firstResolveTriggered = false
    firstRejectError = undefined
  }

  currentScope && onServerPrefetch?.(() => {
    if (!isEnabled.value || (isServer && currentOptions.value?.prefetch === false)) return

    return new Promise<void>((resolve, reject) => {
      firstResolve = () => {
        resetFirstResolveReject()
        resolve()
      }
      firstReject = (apolloError: ApolloError) => {
        resetFirstResolveReject()
        reject(apolloError)
      }

      if (firstResolveTriggered) {
        firstResolve()
      } else if (firstRejectError) {
        firstReject(firstRejectError)
      }
    }).finally(stop)
  })

  // Apollo Client
  const { resolveClient } = useApolloClient()

  function getClient () {
    return resolveClient(currentOptions.value?.clientId)
  }

  // Query

  const query: Ref<ObservableQuery<TResult, TVariables> | null | undefined> = shallowRef()
  let observer: ObservableSubscription | undefined
  let started = false
  let ignoreNextResult = false
  let firstStart = true

  /**
   * Starts watching the query
   */
  function start () {
    if (
      started || !isEnabled.value ||
      (isServer && currentOptions.value?.prefetch === false) ||
      !currentDocument
    ) {
      tryFirstResolve()
      return
    }

    // On server the watchers on document, variables and options are not triggered
    if (isServer) {
      applyDocument(documentRef.value)
      applyVariables(variablesRef.value)
      applyOptions(unref(optionsRef))
    }

    started = true
    error.value = null
    loading.value = true

    const client = getClient()

    query.value = client.watchQuery<TResult, TVariables>({
      query: currentDocument,
      variables: currentVariables ?? {} as TVariables,
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
    if (!isServer && (firstStart || !currentOptions.value?.keepPreviousResult) && (currentOptions.value?.fetchPolicy !== 'no-cache' || currentOptions.value.notifyOnNetworkStatusChange)) {
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

    firstStart = false
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

  function getErrorPolicy () {
    const client = resolveClient(currentOptions.value?.clientId)
    return currentOptions.value?.errorPolicy || client.defaultOptions?.watchQuery?.errorPolicy
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
    // ApolloQueryResult.errors may be set at the same time as we get a result.
    // The code is only relevant when `errorPolicy` is `all`, because for other situations it
    // could hapen that next and error are called at the same time and then it will lead to multiple
    // onError calls.
    const errorPolicy = getErrorPolicy()
    if (errorPolicy && errorPolicy === 'all' && !queryResult.error && queryResult.errors?.length) {
      processError(resultErrorsToApolloError(queryResult.errors))
    }

    tryFirstResolve()
  }

  function processNextResult (queryResult: ApolloQueryResult<TResult>) {
    result.value = queryResult.data && Object.keys(queryResult.data).length === 0 ? undefined : queryResult.data
    loading.value = queryResult.loading
    networkStatus.value = queryResult.networkStatus
    // Wait for handlers to be registered
    nextTick(() => {
      resultEvent.trigger(queryResult, {
        client: getClient(),
      })
    })
  }

  function onError (queryError: unknown) {
    if (ignoreNextResult) {
      ignoreNextResult = false
      return
    }

    // any error should already be an ApolloError, but we make sure
    const apolloError = toApolloError(queryError)
    const errorPolicy = getErrorPolicy()

    if (errorPolicy && errorPolicy !== 'none') {
      processNextResult((query.value as ObservableQuery<TResult, TVariables>).getCurrentResult())
    }
    processError(apolloError)
    tryFirstReject(apolloError)
    // The observable closes the sub if an error occurs
    resubscribeToQuery()
  }

  function processError (apolloError: ApolloError) {
    error.value = apolloError
    loading.value = false
    networkStatus.value = 8
    // Wait for handlers to be registered
    nextTick(() => {
      errorEvent.trigger(apolloError, {
        client: getClient(),
      })
    })
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
    tryFirstResolve()
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
    if (!started || restarting) return
    if (!isRestartDebounceSetup) updateRestartFn()
    debouncedRestart()
  }

  // Applying document
  let currentDocument: DocumentNode | null | undefined = documentRef.value

  // Enabled state

  const forceDisabled = ref(lazy)
  const enabledOption = computed(() => !currentOptions.value || currentOptions.value.enabled == null || currentOptions.value.enabled)
  const isEnabled = computed(() => enabledOption.value && !forceDisabled.value && !!documentRef.value)

  // Applying options first (in case it disables the query)
  watch(() => unref(optionsRef), applyOptions, {
    deep: true,
    immediate: true,
  })

  function applyOptions (value: UseQueryOptions<TResult, TVariables>) {
    if (currentOptions.value && (
      currentOptions.value.throttle !== value.throttle ||
      currentOptions.value.debounce !== value.debounce
    )) {
      updateRestartFn()
    }
    currentOptions.value = value
    restart()
  }

  // Applying document
  watch(documentRef, applyDocument)

  function applyDocument (value: DocumentNode | null | undefined) {
    currentDocument = value
    restart()
  }

  // Applying variables
  let currentVariables: TVariables | undefined
  let currentVariablesSerialized: string
  watch(() => {
    if (isEnabled.value) {
      return variablesRef.value
    } else {
      return undefined
    }
  }, applyVariables, {
    deep: true,
    immediate: true,
  })

  function applyVariables (value?: TVariables) {
    const serialized = JSON.stringify([value, isEnabled.value])
    if (serialized !== currentVariablesSerialized) {
      currentVariables = value
      restart()
    }
    currentVariablesSerialized = serialized
  }

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

  // Auto start & stop

  watch(isEnabled, value => {
    if (value) {
      nextTick(() => {
        start()
      })
    } else {
      stop()
    }
  })

  if (isEnabled.value) {
    start()
  }

  // Teardown
  if (currentScope) {
    onScopeDispose(() => {
      stop()
      subscribeToMoreItems.length = 0
    })
  } else {
    console.warn('[Vue apollo] useQuery() is called outside of an active effect scope and the query will not be automatically stopped.')
  }

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
