<script setup lang="ts" generic="TData = any, TVariables extends OperationVariables = OperationVariables">
import type { ErrorLike, MaybeMasked, OperationVariables, TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'
import { mergeOptions } from './utils.ts'

type Data = MaybeMasked<TData>

// `Callback<T>` is conditional, need to manually type here
type Subscription = Omit<
  useSubscription.Result<TData, TVariables>,
  'onResult' | 'onError' | 'onComplete'
> & {
  onResult: (fn: (data: Data) => void) => void
  onError: (fn: (error: ErrorLike) => void) => void
  onComplete: (fn: () => void) => void
}

const {
  subscription,
  variables,
  disabled = false,
  clientId,
  options,
} = defineProps<{
  /** The subscription document. */
  subscription: TypedDocumentNode<TData, TVariables>
  // `NoInfer` so `TVariables` follows the document, not this binding.
  /** Variables for the subscription. */
  variables?: NoInfer<TVariables> | undefined
  /** Stop the subscription. */
  disabled?: boolean
  /** Name of the client to use, from the provided `ApolloClients` map. */
  clientId?: string | undefined
  /** Escape hatch for any other `useSubscription` option. */
  options?: useSubscription.Options<TData, TVariables> | undefined
}>()

const emit = defineEmits<{
  result: [data: Data]
  error: [error: ErrorLike]
  complete: []
}>()

/** Optional: with no slot the component renders nothing and `@result` is the API. */
defineSlots<{
  default?: (props: {
    result: Data | undefined
    loading: boolean
    error: ErrorLike | undefined
    start: Subscription['start']
    stop: Subscription['stop']
    restart: Subscription['restart']
  }) => any
}>()

const { result, loading, error, start, stop, restart, onResult, onError, onComplete, ...rest }
  = useSubscription<TData, TVariables>(
    () => subscription,
    () => mergeOptions<useSubscription.Options<TData, TVariables>>(options, {
      variables,
      // Only asserted when set: left undefined, `options.enabled` still applies.
      enabled: disabled ? false : undefined,
      clientId,
    }),
  ) as Subscription

onResult(data => emit('result', data))
onError(failure => emit('error', failure))
onComplete(() => emit('complete'))

defineExpose({ result, loading, error, start, stop, restart, onResult, onError, onComplete, ...rest })
</script>

<template>
  <slot
    :result="(result as Data | undefined)"
    :loading="loading"
    :error="error"
    :start="start"
    :stop="stop"
    :restart="restart"
  />
</template>
