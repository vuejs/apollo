import { DocumentNode } from 'graphql'
import {
  Ref,
  ref,
  watch,
  isRef,
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  nextTick,
} from 'vue-demi'
import {
  OperationVariables,
  SubscriptionOptions,
  FetchResult,
  Observable,
  ObservableSubscription,
} from '@apollo/client/core'
import { throttle, debounce } from 'throttle-debounce'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
import { useApolloClient } from './useApolloClient'
import { useEventHook } from './util/useEventHook'
import { trackSubscription } from './util/loadingTracking'

export interface UseSubscriptionOptions <
  TResult = any,
  TVariables = OperationVariables
> extends Omit<SubscriptionOptions<TVariables>, 'query' | 'variables'> {
  clientId?: string
  enabled?: boolean
  throttle?: number
  debounce?: number
}

export interface UseSubscriptionReturn<TResult, TVariables> {
  result: Ref<TResult>
  loading: Ref<boolean>
  error: Ref<Error>
  start: () => void
  stop: () => void
  restart: () => void
  document: Ref<DocumentNode>
  variables: Ref<TVariables>
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>>
  subscription: Ref<Observable<FetchResult<TResult, Record<string, any>, Record<string, any>>>>
  onResult: (fn: (param?: FetchResult<TResult, Record<string, any>, Record<string, any>>) => void) => {
      off: () => void
  }
  onError: (fn: (param?: Error) => void) => {
      off: () => void
  }
}


/**
 * Use a subscription that does not require variables or options.
 * */
export function useSubscription<TResult = any>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>
): UseSubscriptionReturn<TResult, undefined>

/**
 * Use a subscription that requires options but not variables.
 */
export function useSubscription<TResult = any, TVariables extends undefined = undefined>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables,
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>> | ReactiveFunction<UseSubscriptionOptions<TResult, TVariables>>
): UseSubscriptionReturn<TResult, TVariables>

/**
 * Use a subscription that requires variables.
 */
export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables>
): UseSubscriptionReturn<TResult, TVariables>

/**
 * Use a subscription that has optional variables.
 */
export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>
): UseSubscriptionReturn<TResult, TVariables>

/**
 * Use a subscription that requires variables and options.
 */
export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables>,
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>> | ReactiveFunction<UseSubscriptionOptions<TResult, TVariables>>
): UseSubscriptionReturn<TResult, TVariables>

export function useSubscription <
  TResult,
  TVariables
> (
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables> = null,
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>> | ReactiveFunction<UseSubscriptionOptions<TResult, TVariables>> = null
): UseSubscriptionReturn<TResult, TVariables> {
  // Is on server?
  const vm: any = getCurrentInstance()
  const isServer = vm?.$isServer

  if (variables == null) variables = ref()
  if (!options) options = {}
  const documentRef = paramToRef(document)
  const variablesRef = paramToRef(variables)
  const optionsRef = paramToReactive(options)

  const result = ref<TResult>()
  const resultEvent = useEventHook<FetchResult<TResult>>()
  const error = ref<Error>(null)
  const errorEvent = useEventHook<Error>()

  const loading = ref(false)
  trackSubscription(loading)

  // Apollo Client
  const { resolveClient } = useApolloClient()

  const subscription: Ref<Observable<FetchResult<TResult>>> = ref()
  let observer: ObservableSubscription
  let started = false

  function start () {
    if (started || !isEnabled.value || isServer) return
    started = true
    loading.value = true

    const client = resolveClient(currentOptions.value.clientId)

    subscription.value = client.subscribe<TResult, TVariables>({
      query: currentDocument,
      variables: currentVariables,
      ...currentOptions.value,
    })

    observer = subscription.value.subscribe({
      next: onNextResult,
      error: onError,
    })
  }

  function onNextResult (fetchResult: FetchResult<TResult>) {
    result.value = fetchResult.data
    loading.value = false
    resultEvent.trigger(fetchResult)
  }

  function onError (fetchError: any) {
    error.value = fetchError
    loading.value = false
    errorEvent.trigger(fetchError)
  }

  function stop () {
    if (!started) return
    started = false
    loading.value = false

    if (subscription.value) {
      subscription.value = null
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
    nextTick(() => {
      if (started) {
        stop()
        start()
      }
      restarting = false
    })
  }

  let debouncedRestart: Function
  function updateRestartFn () {
    if (currentOptions.value.throttle) {
      debouncedRestart = throttle(currentOptions.value.throttle, baseRestart)
    } else if (currentOptions.value.debounce) {
      debouncedRestart = debounce(currentOptions.value.debounce, baseRestart)
    } else {
      debouncedRestart = baseRestart
    }
  }

  function restart () {
    if (!debouncedRestart) updateRestartFn()
    debouncedRestart()
  }

  // Applying options
  const currentOptions = ref<UseSubscriptionOptions<TResult, TVariables>>()
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

  // Internal enabled returned to user
  // @TODO Doesn't fully work yet, need to initialize with option
  // const enabled = ref<boolean>()
  const enabledOption = computed(() => !currentOptions.value || currentOptions.value.enabled == null || currentOptions.value.enabled)
  // const isEnabled = computed(() => !!((typeof enabled.value === 'boolean' && enabled.value) && enabledOption.value))
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
  onBeforeUnmount(stop)

  return {
    result,
    loading,
    error,
    // @TODO doesn't fully work yet
    // enabled,
    start,
    stop,
    restart,
    document: documentRef,
    variables: variablesRef,
    options: optionsRef,
    subscription,
    onResult: resultEvent.on,
    onError: errorEvent.on,
  }
}
