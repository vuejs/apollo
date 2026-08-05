<script setup lang="ts" generic="TData = any, TVariables extends OperationVariables = OperationVariables">
import type { ApolloClient, ErrorLike, MaybeMasked, OperationVariables, TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'
import { getCurrentInstance, onUpdated } from 'vue'
import { mergeOptions } from './utils.ts'

type DoneResult = ApolloClient.MutateResult<MaybeMasked<TData>>

// `Callback<T>` is conditional, need to manually type here
type Mutation = Omit<useMutation.Result<TData, TVariables>, 'onDone' | 'onError'> & {
  onDone: (fn: (result: DoneResult) => void) => void
  onError: (fn: (error: ErrorLike) => void) => { off: () => void }
}

const { mutation, variables, clientId, options } = defineProps<{
  /** The mutation document. */
  mutation: TypedDocumentNode<TData, TVariables>
  // `NoInfer` so `TVariables` follows the document, not this binding.
  /** Variables applied to every call, unless overridden in `mutate()`. */
  variables?: NoInfer<TVariables> | undefined
  /** Name of the client to use, from the provided `ApolloClients` map. */
  clientId?: string | undefined
  /** Escape hatch for any other `useMutation` option. */
  options?: useMutation.Options<TData, TVariables> | undefined
}>()

const emit = defineEmits<{
  done: [result: DoneResult]
  error: [error: ErrorLike]
}>()

defineSlots<{
  default?: (props: {
    mutate: Mutation['mutate']
    loading: boolean
    error: ErrorLike | undefined
    called: boolean
    /** The most recent result, or `null` once `reset()` has cleared it. */
    result: MaybeMasked<TData> | null | undefined
    /** Clears `result`, `error` and `called`, so the mutation looks untouched again. */
    reset: Mutation['reset']
  }) => any
}>()

const { mutate, loading, error, called, result, reset, onDone, onError, ...rest } = useMutation<TData, TVariables>(
  () => mutation,
  () => mergeOptions<useMutation.Options<TData, TVariables>>(options, {
    variables,
    clientId,
  }),
) as Mutation

const instance = getCurrentInstance()!

// Read off the vnode because `useAttrs()` drops anything declared in `defineEmits`.
function hasErrorListener() {
  const listeners = instance.vnode.props

  return listeners != null && (listeners.onError != null || listeners.onErrorOnce != null)
}

// Bridged only while the parent listens: `throws: 'auto'` stops rejecting once an
// `onError` handler exists, so registering unconditionally would change the default.
let offError: (() => void) | undefined

function syncErrorListener() {
  if (hasErrorListener()) {
    offError ??= onError(failure => emit('error', failure)).off
  }
  else {
    offError?.()
    offError = undefined
  }
}

onDone(result => emit('done', result))
syncErrorListener()

// The parent can start or stop listening between renders.
onUpdated(syncErrorListener)

defineExpose({ mutate, loading, error, called, result, reset, onDone, onError, ...rest })
</script>

<template>
  <slot
    :mutate="mutate"
    :loading="loading"
    :error="error"
    :called="called"
    :result="result"
    :reset="reset"
  />
</template>
