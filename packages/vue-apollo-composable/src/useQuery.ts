import { ref, Ref, isRef, computed, watch, onServerPrefetch, getCurrentInstance, onBeforeUnmount } from 'vue-demi'
import Vue from 'vue'
import { DocumentNode } from 'graphql'
import {
  OperationVariables,
  WatchQueryOptions,
  ObservableQuery,
  ApolloQueryResult,
  SubscribeToMoreOptions,
  FetchMoreQueryOptions,
  FetchMoreOptions,
} from 'apollo-client'
import { Subscription } from 'apollo-client/util/Observable'
import { throttle, debounce } from 'throttle-debounce'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
import { useEventHook } from './util/useEventHook'
import { trackQuery } from './util/loadingTracking'

export interface UseQueryOptions<
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
  unsubscribeFns: Function[]
}

export interface UseQueryReturn<TResult, TVariables> {
  result: Ref<TResult>
  loading: Ref<boolean>
  networkStatus: Ref<number>
  error: Ref<Error>
  start: () => void
  stop: () => void
  restart: () => void
  document: Ref<DocumentNode>
  variables: Ref<TVariables>
  options: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>>
  query: Ref<ObservableQuery<TResult, TVariables>>
  refetch: (variables?: TVariables) => Promise<ApolloQueryResult<TResult>>
  fetchMore: <K extends keyof TVariables>(options: FetchMoreQueryOptions<TVariables, K> & FetchMoreOptions<TResult, TVariables>) => Promise<ApolloQueryResult<TResult>>
  subscribeToMore: <TSubscriptionVariables = OperationVariables, TSubscriptionData = TResult>(options: SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData> | Ref<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>> | ReactiveFunction<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>>) => void
  onResult: (fn: (param?: ApolloQueryResult<TResult>) => void) => {
      off: () => void
  }
  onError: (fn: (param?: Error) => void) => {
      off: () => void
  }
}

/**
 * Use a query that does not require variables or options.
 * */
export function useQuery<TResult = any>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>
): UseQueryReturn<TResult, undefined>

/**
 * Use a query that has optional variables but not options
 */
export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>
): UseQueryReturn<TResult, TVariables>

/**
 * Use a query that has required variables but not options
 */
export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables
): UseQueryReturn<TResult, TVariables>

/**
 * Use a query that requires options but not variables.
 */
export function useQuery<TResult = any, TVariables extends undefined = undefined>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables,
  options: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>> | ReactiveFunction<UseQueryOptions<TResult, TVariables>>
): UseQueryReturn<TResult, TVariables>

/**
 * Use a query that requires variables and options.
 */
export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables>,
  options: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>> | ReactiveFunction<UseQueryOptions<TResult, TVariables>>
): UseQueryReturn<TResult, TVariables>

export function useQuery<
  TResult,
  TVariables extends OperationVariables
> (
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables?: TVariables | Ref<TVariables> | ReactiveFunction<TVariables>,
  options?: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>> | ReactiveFunction<UseQueryOptions<TResult, TVariables>>,
): UseQueryReturn<TResult, TVariables> {
  // Is on server?
  const vm = getCurrentInstance()
  const isServer = vm.$isServer

  if (variables == null) variables = ref()
  if (options == null) options = {}
  const documentRef = paramToRef(document)
  const variablesRef = paramToRef(variables)
  const optionsRef = paramToReactive(options)

  // Result
  /**
   * Result from the query
   */
  const result = ref<TResult>()
  const resultEvent = useEventHook<ApolloQueryResult<TResult>>()
  const error = ref<Error>(null)
  const errorEvent = useEventHook<Error>()

  // Loading

  /**
   * Indicates if a network request is pending
   */
  const loading = ref(false)
  trackQuery(loading)
  const networkStatus = ref<number>()

  // SSR
  let firstResolve: Function
  let firstReject: Function
  onServerPrefetch(() => new Promise((resolve, reject) => {
    firstResolve = resolve
    firstReject = reject
  }).then(stop).catch(stop))

  // Apollo Client
  const { resolveClient } = useApolloClient()

  // Query

  const query: Ref<ObservableQuery<TResult, TVariables>> = ref()
  let observer: Subscription
  let started = false

  /**
   * Starts watching the query
   */
  function start () {
    if (started || !isEnabled.value) return
    if (isServer && currentOptions.value.prefetch === false) return

    started = true
    loading.value = true

    const client = resolveClient(currentOptions.value.clientId)

    query.value = client.watchQuery<TResult, TVariables>({
      query: currentDocument,
      variables: currentVariables,
      ...currentOptions.value,
      ...isServer ? {
        fetchPolicy: 'network-only'
      } : {}
    })

    startQuerySubscription()

    if (!isServer && (currentOptions.value.fetchPolicy !== 'no-cache' || currentOptions.value.notifyOnNetworkStatusChange)) {
      const currentResult = query.value.getCurrentResult()

      if (!currentResult.loading || currentOptions.value.notifyOnNetworkStatusChange) {
        onNextResult(currentResult as ApolloQueryResult<TResult>)
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
    observer = query.value.subscribe({
      next: onNextResult,
      error: onError,
    })
  }

  function onNextResult (queryResult: ApolloQueryResult<TResult>) {
    processNextResult(queryResult)

    // Result errors
    // This is set when `errorPolicy` is `all`
    if (queryResult.errors && queryResult.errors.length) {
      const e = new Error(`GraphQL error: ${queryResult.errors.map(e => e.message).join(' | ')}`)
      Object.assign(e, {
        graphQLErrors: queryResult.errors,
        networkError: null,
      })
      processError(e)
    } else {
      if (firstResolve) {
        firstResolve()
        firstResolve = null
        stop()
      }
    }
  }

  function processNextResult (queryResult: ApolloQueryResult<TResult>) {
    result.value = queryResult.data && Object.keys(queryResult.data).length === 0 ? null : queryResult.data
    loading.value = queryResult.loading
    networkStatus.value = queryResult.networkStatus
    resultEvent.trigger(queryResult)
  }

  function onError (queryError: any) {
    processNextResult(query.value.getCurrentResult() as ApolloQueryResult<TResult>)
    processError(queryError)
    if (firstReject) {
      firstReject(queryError)
      firstReject = null
      stop()
    }
    // The observable closes the sub if an error occurs
    resubscribeToQuery()
  }

  function processError (queryError: any) {
    error.value = queryError
    loading.value = false
    networkStatus.value = 8
    errorEvent.trigger(queryError)
  }

  function resubscribeToQuery () {
    if (!query.value) return
    const lastError = query.value.getLastError()
    const lastResult = query.value.getLastResult()
    query.value.resetLastResults()
    startQuerySubscription()
    Object.assign(query.value, { lastError, lastResult })
  }

  let onStopHandlers: (() => void)[] = []

  /**
   * Stop watching the query
   */
  function stop () {
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
      observer = null
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
    Vue.nextTick(() => {
      if (started) {
        stop()
        start()
      }
      restarting = false
    })
  }

  let debouncedRestart: Function
  let isRestartDebounceSetup = false
  function updateRestartFn () {
    // On server, will be called before currentOptions is initialized
    // @TODO investigate
    if (!currentOptions) {
      debouncedRestart = baseRestart
    } else {
      if (currentOptions.value.throttle) {
        debouncedRestart = throttle(currentOptions.value.throttle, baseRestart)
      } else if (currentOptions.value.debounce) {
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
    immediate: true
  })

  // Applying variables
  let currentVariables: TVariables
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
    immediate: true
  })

  // Applying options
  const currentOptions = ref<UseQueryOptions<TResult, TVariables>>()
  watch(() => isRef(optionsRef) ? optionsRef.value : optionsRef, value => {
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
    immediate: true
  })

  // Fefetch

  function refetch (variables: TVariables = null) {
    if (query.value) {
      if (variables) {
        currentVariables = variables
      }
      return query.value.refetch(variables)
    }
  }

  // Fetch more

  function fetchMore<K extends keyof TVariables> (options: FetchMoreQueryOptions<TVariables, K> & FetchMoreOptions<TResult, TVariables>) {
    if (query.value) {
      return query.value.fetchMore(options)
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
      ReactiveFunction<SubscribeToMoreOptions<TResult, TSubscriptionVariables, TSubscriptionData>>
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
      immediate: true
    })
  }

  function addSubscribeToMore (item: SubscribeToMoreItem) {
    if (!started) return
    const unsubscribe = query.value.subscribeToMore(item.options)
    onStopHandlers.push(unsubscribe)
    item.unsubscribeFns.push(unsubscribe)
  }

  // Internal enabled returned to user
  // @TODO Doesn't fully work yet, need to initialize with option
  // const enabled = ref<boolean>()
  const enabledOption = computed(() => !currentOptions.value || currentOptions.value.enabled == null || currentOptions.value.enabled)
  // const isEnabled = computed(() => !!((typeof enabled.value !== 'boolean' || enabled.value) && enabledOption.value))
  const isEnabled = enabledOption

  // watch(enabled, value => {
  //   if (value == null) {
  //     enabled.value = enabledOption.value
  //   }
  // })

  // Auto start & stop
  watch(isEnabled, value => {
    if (value) {
      start()
    } else {
      stop()
    }
  }, {
    immediate: true
  })

  // Teardown
  onBeforeUnmount(() => {
    stop()
    subscribeToMoreItems.length = 0
  })

  return {
    result,
    loading,
    networkStatus,
    error,
    // @TODO doesn't fully work yet
    // enabled,
    start,
    stop,
    restart,
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
