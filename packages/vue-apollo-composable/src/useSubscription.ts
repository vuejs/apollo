import { DocumentNode } from 'graphql'
import Vue from 'vue'
import { Ref, ref, watch, isRef, onUnmounted, computed } from '@vue/composition-api'
import { OperationVariables, SubscriptionOptions } from 'apollo-client'
import { Observable, Subscription } from 'apollo-client/util/Observable'
import { FetchResult } from 'apollo-link'
import { ReactiveFunction } from './util/ReactiveFunction'
import { paramToRef } from './util/paramToRef'
import { paramToReactive } from './util/paramToReactive'
import { useApolloClient } from './useApolloClient'

export interface UseSubscriptionOptions <
  TResult = any,
  TVariables = OperationVariables
> extends Omit<SubscriptionOptions<TVariables>, 'query' | 'variables'> {
  clientId?: string
  enabled?: boolean
}

export function useSubscription <
  TResult = any,
  TVariables = OperationVariables
> (
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  variables: TVariables | Ref<TVariables> | ReactiveFunction<TVariables> = null,
  options: UseSubscriptionOptions<TResult, TVariables> | Ref<UseSubscriptionOptions<TResult, TVariables>> | ReactiveFunction<UseSubscriptionOptions<TResult, TVariables>> = null
) {
  if (variables == null) variables = ref()
  if (!options) options = {}
  const documentRef = paramToRef(document)
  const variablesRef = paramToRef(variables)
  const optionsRef = paramToReactive(options)

  const result = ref<TResult>()
  const error = ref(null)

  const loading = ref(false)

  // Apollo Client
  const { resolveClient } = useApolloClient()

  const subscription: Ref<Observable<FetchResult<TResult>>> = ref()
  let observer: Subscription
  let started = false

  function start () {
    if (started || !isEnabled.value) return
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
  }

  function onError (fetchError: any) {
    error.value = fetchError
    loading.value = false
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
  const currentOptions = ref<UseSubscriptionOptions<TResult, TVariables>>()
  watch(() => isRef(optionsRef) ? optionsRef.value : optionsRef, value => {
    currentOptions.value = value
    restart()
  }, {
    deep: true,
  })

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
  }
}
