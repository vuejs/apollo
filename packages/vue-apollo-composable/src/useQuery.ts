import { ref, watch, onUnmounted, Ref, isRef, computed } from '@vue/composition-api'
import Vue from 'vue'
import { DocumentNode } from 'graphql'
import { OperationVariables, WatchQueryOptions, ObservableQuery, ApolloQueryResult, SubscribeToMoreOptions } from 'apollo-client'
import { Subscription } from 'apollo-client/util/Observable'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
// import { trackQuery } from './util/loadingTracking'

export interface UseQueryOptions<
  TResult = any,
  TVariables = OperationVariables
> extends Omit<WatchQueryOptions<TVariables>, 'query' | 'variables'> {
  clientId?: string
  enabled?: boolean
}

interface SubscribeToMoreItem {
  options: any
  unsubscribeFns: Function[]
}

export function useQuery<
  TResult = any,
  TVariables = OperationVariables,
  TCacheShape = any
> (
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables> = null,
  options: UseQueryOptions<TResult, TVariables> | Ref<UseQueryOptions<TResult, TVariables>> | ReactiveFunction<UseQueryOptions<TResult, TVariables>> = {},
) {
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
  // trackQuery(loading)
  const networkStatus = ref<number>()

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
    started = true
    loading.value = true

    const client = resolveClient(currentOptions.value.clientId)

    query.value = client.watchQuery<TResult, TVariables>({
      query: currentDocument,
      variables: currentVariables,
      ...currentOptions.value,
    })

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
    }
  }

  function processNextResult (queryResult: ApolloQueryResult<TResult>) {
    result.value = queryResult.data && Object.keys(queryResult.data).length === 0 ? null : queryResult.data
    loading.value = queryResult.loading
    networkStatus.value = queryResult.networkStatus
    resultEvent.trigger(queryResult)
  }

  function onError (queryError: any) {
    processNextResult(query.value.currentResult() as ApolloQueryResult<TResult>)
    processError(queryError)
  function processError (queryError: any) {
    error.value = queryError
    loading.value = false
    networkStatus.value = 8
    errorEvent.trigger(queryError)
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
  function restart () {
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

  // Applying document
  let currentDocument: DocumentNode
  watch(documentRef, value => {
    currentDocument = value
    restart()
  })

  // Applying variables
  let currentVariables: TVariables
  watch(variablesRef, value => {
    currentVariables = value
    restart()
  }, {
    deep: true,
  })

  // Applying options
  const currentOptions = ref<UseQueryOptions<TResult, TVariables>>()
  watch(() => isRef(optionsRef) ? optionsRef.value : optionsRef, value => {
    currentOptions.value = value
    restart()
  }, {
    deep: true,
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
  const enabled = ref<boolean>()
  const enabledOption = computed(() => !currentOptions.value || currentOptions.value.enabled == null || currentOptions.value.enabled)
  const isEnabled = computed(() => !!((typeof enabled.value === 'boolean' && enabled.value) && enabledOption.value))

  watch(enabled, value => {
    if (value == null) {
      enabled.value = enabledOption.value
    }
  })

  // Auto start & stop
  watch(isEnabled, value => {
    if (value) {
      start()
    } else {
      stop()
    }
  })

  // Teardown
  onUnmounted(() => {
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
    subscribeToMore,
    onResult: resultEvent.on,
    onError: errorEvent.on,
  }
}
