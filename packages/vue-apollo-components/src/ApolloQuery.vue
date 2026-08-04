<script setup lang="ts" generic="TData = any, TVariables extends OperationVariables = OperationVariables">
import type { ErrorLike, MaybeMasked, OperationVariables, TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { computed, provide } from 'vue'
import { ApolloQueryKey } from './keys.ts'
import { mergeOptions } from './utils.ts'

type Data = MaybeMasked<TData>

const {
  query,
  variables,
  disabled = false,
  fetchPolicy,
  pollInterval,
  debounce,
  throttle,
  // Explicit default, or Vue casts the absent boolean to `false` and clobbers `options`.
  keepPreviousResult = undefined,
  clientId,
  empty,
  options,
} = defineProps<{
  /** The query document. */
  query: TypedDocumentNode<TData, TVariables>
  // `NoInfer` so `TVariables` follows the document, not this binding.
  /** Variables for the query. */
  variables?: NoInfer<TVariables> | undefined
  /** Skip execution until a condition is met. */
  disabled?: boolean
  /** How the query reads from and writes to the cache. */
  fetchPolicy?: useQuery.Options<TData, TVariables>['fetchPolicy']
  /** Refetch every N milliseconds. */
  pollInterval?: number | undefined
  /** Delay variable updates (ms). `loading` covers the window. */
  debounce?: number | undefined
  /** Throttle variable updates (ms). `loading` covers the window. */
  throttle?: number | undefined
  /**
   * Keep the previous result on screen while new variables are in flight.
   *
   * Off by default, as in `useQuery`. Opt in for search and pagination, where clearing the
   * list on every change flickers.
   */
  keepPreviousResult?: boolean | undefined
  /** Name of the client to use, from the provided `ApolloClients` map. */
  clientId?: string | undefined
  /**
   * Decides whether a result counts as empty, selecting the `#empty` slot.
   *
   * Without it `#empty` is never used, so `#data` handles the empty case itself.
   */
  empty?: ((data: Data) => boolean) | undefined
  /** Escape hatch for any other `useQuery` option. */
  options?: useQuery.Options<TData, TVariables> | undefined
}>()

const emit = defineEmits<{
  result: [data: Data]
  completeResult: [data: Data]
  partialResult: [data: Data]
  streamingResult: [data: Data]
  error: [error: ErrorLike]
  nextState: [state: useQuery.Current<Data>]
}>()

const slots = defineSlots<{
  /** Opinionated mode. Providing this slot selects it, and `data` is never undefined. */
  data?: (props: {
    data: Data
    /**
     * Set when the query errored but there is still data to show, such as a failed refetch
     * or a partial result under `errorPolicy: 'all'`. `#error` covers the other case.
     */
    error: ErrorLike | undefined
    isPreviousResult: boolean
    loading: boolean
    pending: boolean
    refetch: Query['refetch']
    fetchMore: Query['fetchMore']
  }) => any
  /** Shown while the first result is loading. Opinionated mode only. */
  loading?: () => any
  /** Shown when the query failed and there is nothing to display. Opinionated mode only. */
  error?: (props: { error: ErrorLike, refetch: Query['refetch'] }) => any
  /**
   * Shown when the `empty` prop returns `true`, and as the last branch when the query
   * settles with nothing to show. Without the `empty` prop, `#data` owns the empty result.
   */
  empty?: () => any
  /**
   * Raw mode. Receives the flattened query state and its methods.
   *
   * Rendered in both modes, so nested renderless children still mount.
   */
  default?: (props: DefaultSlotProps) => any
}>()

// `Callback<T>` is conditional, need to manually type here
type Query = Omit<
  useQuery.Result<TData, TVariables>,
  'onResult' | 'onCompleteResult' | 'onPartialResult' | 'onStreamingResult' | 'onError' | 'onNextState'
> & {
  onResult: (fn: (data: Data) => void) => void
  onCompleteResult: (fn: (data: Data) => void) => void
  onPartialResult: (fn: (data: Data) => void) => void
  onStreamingResult: (fn: (data: Data) => void) => void
  onError: (fn: (error: ErrorLike) => void) => void
  onNextState: (fn: (state: useQuery.Current<Data>) => void) => void
}
type DefaultSlotProps = useQuery.Current<Data> & Pick<
  Query,
  'refetch' | 'fetchMore' | 'updateQuery' | 'subscribeToMore' | 'start' | 'stop' | 'restart'
>

const isOpinionated = computed(() => slots.data != null)

const {
  current,
  refetch,
  fetchMore,
  onResult,
  onCompleteResult,
  onPartialResult,
  onStreamingResult,
  onError,
  onNextState,
  // Dropped: it would make a template ref to this component a thenable.
  then: _then,
  ...rest
} = useQuery<TData, TVariables>(
  () => query,
  () => mergeOptions<useQuery.Options<TData, TVariables>>(options, {
    variables,
    // Only asserted when set: left undefined, `options.enabled` still applies.
    enabled: disabled ? false : undefined,
    fetchPolicy,
    pollInterval,
    debounce,
    throttle,
    clientId,
    keepPreviousResult,
  }),
) as Query & { then: unknown }

const queryResult = {
  current,
  refetch,
  fetchMore,
  onResult,
  onCompleteResult,
  onPartialResult,
  onStreamingResult,
  onError,
  onNextState,
  ...rest,
}

onResult(data => emit('result', data))
onCompleteResult(data => emit('completeResult', data))
onPartialResult(data => emit('partialResult', data))
onStreamingResult(data => emit('streamingResult', data))
onError(failure => emit('error', failure))
onNextState(state => emit('nextState', state))

provide(ApolloQueryKey, queryResult as unknown as useQuery.Result<any, OperationVariables>)

const hasResult = computed(() => current.value.resultState !== 'empty')

// Without the slot, `#data` owns the empty case.
const isEmpty = computed(() =>
  slots.empty != null
  && hasResult.value
  && empty?.(current.value.result as Data) === true,
)

const defaultSlotProps = computed<DefaultSlotProps>(() => ({
  ...(current.value as useQuery.Current<Data>),
  refetch,
  fetchMore,
  updateQuery: rest.updateQuery,
  subscribeToMore: rest.subscribeToMore,
  start: rest.start,
  stop: rest.stop,
  restart: rest.restart,
}))

defineExpose(queryResult)
</script>

<template>
  <template v-if="isOpinionated">
    <slot v-if="isEmpty" name="empty" />
    <slot
      v-else-if="hasResult"
      name="data"
      :data="(current.result as Data)"
      :error="current.error"
      :isPreviousResult="current.isPreviousResult"
      :loading="current.loading"
      :pending="current.pending"
      :refetch="refetch"
      :fetchMore="fetchMore"
    />
    <slot v-else-if="current.error" name="error" :error="current.error" :refetch="refetch" />
    <slot v-else-if="current.loading" name="loading" />
    <slot v-else-if="!disabled" name="empty" />
  </template>
  <slot v-bind="defaultSlotProps" />
</template>
