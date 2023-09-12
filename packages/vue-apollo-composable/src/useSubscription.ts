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
import type {
  OperationVariables,
  SubscriptionOptions,
  FetchResult,
  Observable,
  ObservableSubscription,
  TypedDocumentNode,
  ApolloError,
} from '@apollo/client/core/index.js'
import { throttle, debounce } from 'throttle-debounce'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
import { useApolloClient } from './useApolloClient'
import { useEventHook } from './util/useEventHook'
import { trackSubscription } from './util/loadingTracking'
import type { CurrentInstance } from './util/types'
import { toApolloError } from './util/toApolloError'
import { isServer } from './util/env'

export interface UseSubscriptionOptions <
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TResult = any,
  TVariables = OperationVariables
> extends Omit<SubscriptionOptions<TVariables>, 'query' | 'variables'> {
  clientId?: string
  enabled?: boolean | Ref<boolean>
  throttle?: number
  debounce?: number
}

type DocumentParameter<TResult, TVariables> = DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode> | TypedDocumentNode<TResult, TVariables> | Ref<TypedDocumentNode<TResult, TVariables>> | ReactiveFunction<TypedDocumentNode<TResult, TVariables>>
type VariablesParameter<TVariables> = TVariables | Ref<TVariables> | ReactiveFunction<TVariables>
type OptionsParameter<TResult, TVariables> = UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>> | ReactiveFunction<UseSubscriptionOptions<TResult, TVariables>>

export interface UseSubscriptionReturn<TResult, TVariables> {
  result: Ref<TResult | null | undefined>
  loading: Ref<boolean>
  error: Ref<ApolloError | null>
  start: () => void
  stop: () => void
  restart: () => void
  document: Ref<DocumentNode>
  variables: Ref<TVariables | undefined>
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>>
  subscription: Ref<Observable<FetchResult<TResult, Record<string, any>, Record<string, any>>> | null>
  onResult: (fn: (param: FetchResult<TResult, Record<string, any>, Record<string, any>>) => void) => {
    off: () => void
  }
  onError: (fn: (param: ApolloError) => void) => {
    off: () => void
  }
}

/**
 * Use a subscription that does not require variables or options.
 * */
export function useSubscription<TResult = any> (
  document: DocumentParameter<TResult, undefined>
): UseSubscriptionReturn<TResult, undefined>

/**
 * Use a subscription that requires options but not variables.
 */
export function useSubscription<TResult = any> (
  document: DocumentParameter<TResult, undefined>,
  variables: undefined | null,
  options: OptionsParameter<TResult, null>
): UseSubscriptionReturn<TResult, null>

/**
 * Use a subscription that requires variables.
 */
export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables> (
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>
): UseSubscriptionReturn<TResult, TVariables>

/**
 * Use a subscription that has optional variables.
 */
export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables> (
  document: DocumentParameter<TResult, TVariables>,
): UseSubscriptionReturn<TResult, TVariables>

/**
 * Use a subscription that requires variables and options.
 */
export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables> (
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>,
  options: OptionsParameter<TResult, TVariables>
): UseSubscriptionReturn<TResult, TVariables>

export function useSubscription <
  TResult,
  TVariables extends Record<string, unknown>
> (
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables> | undefined = undefined,
  options: OptionsParameter<TResult, TVariables> = {},
): UseSubscriptionReturn<TResult, TVariables> {
  // Is on server?
  const vm = getCurrentInstance() as CurrentInstance | null

  const documentRef = paramToRef(document)
  const variablesRef = paramToRef(variables)
  const optionsRef = paramToReactive(options)

  const result = ref<TResult | null | undefined>()
  const resultEvent = useEventHook<FetchResult<TResult>>()
  const error = ref<ApolloError | null>(null)
  const errorEvent = useEventHook<ApolloError>()

  const loading = ref(false)
  vm && trackSubscription(loading)

  // Apollo Client
  const { resolveClient } = useApolloClient()

  const subscription: Ref<Observable<FetchResult<TResult>> | null> = ref(null)
  let observer: ObservableSubscription | null = null
  let started = false

  function start () {
    if (started || !isEnabled.value || isServer) return
    started = true
    loading.value = true

    const client = resolveClient(currentOptions.value?.clientId)

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

  function onError (fetchError: unknown) {
    const apolloError = toApolloError(fetchError)

    error.value = apolloError
    loading.value = false
    errorEvent.trigger(apolloError)
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
  function updateRestartFn () {
    if (currentOptions.value?.throttle) {
      debouncedRestart = throttle(currentOptions.value.throttle, baseRestart)
    } else if (currentOptions.value?.debounce) {
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
    immediate: true,
  })

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
    immediate: true,
  })

  // Teardown
  vm && onBeforeUnmount(stop)

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
