import { DocumentNode } from 'graphql'
import Vue from 'vue'
import { Ref, ref, watch, isRef, onUnmounted, computed, getCurrentInstance } from '@vue/composition-api'
import { OperationVariables, SubscriptionOptions } from 'apollo-client'
import { Observable, Subscription } from 'apollo-client/util/Observable'
import { FetchResult } from 'apollo-link'
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

export function useSubscription <
  TResult = any,
  TVariables = OperationVariables
> (
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables> = null,
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>> | ReactiveFunction<UseSubscriptionOptions<TResult, TVariables>> = null
) {
  // Is on server?
  const vm = getCurrentInstance()
  const isServer = vm.$isServer

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
  let observer: Subscription
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
    Vue.nextTick(() => {
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
  })

  // Teardown
  onUnmounted(stop)

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
