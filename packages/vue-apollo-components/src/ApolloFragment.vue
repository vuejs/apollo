<script setup lang="ts" generic="TData = any, TVariables extends OperationVariables = OperationVariables">
import type { DataValue, DocumentNode, MaybeMasked, OperationVariables, TypedDocumentNode } from '@apollo/client'
import type { MissingTree } from '@apollo/client/cache'
import { useFragment } from '@vue/apollo-composable'
import { computed } from 'vue'
import { mergeOptions } from './utils.ts'

type State = useFragment.Current<TData>
type Data = MaybeMasked<TData>

// `Callback<T>` is conditional, need to manually type here
type OnNextState = (fn: (state: State) => void) => void

const {
  fragment,
  from,
  fragmentName,
  variables,
  // Explicit default, or Vue casts the absent boolean to `false` and clobbers `options`.
  optimistic = undefined,
  clientId,
  options,
} = defineProps<{
  /** A GraphQL fragment document. */
  fragment: DocumentNode | TypedDocumentNode<TData, TVariables>
  /**
   * Cache identifiable entity to read the fragment from.
   *
   * Accepts a masked object from a parent query, a `{ __ref }` reference, or a cache ID
   * string.
   */
  from: NonNullable<useFragment.FromValue<TData>>
  /** Name of the fragment to use, when the document declares more than one. */
  fragmentName?: string | undefined
  // `NoInfer` so `TVariables` follows the document, not this binding.
  /** Variables used when reading the fragment. */
  variables?: NoInfer<TVariables> | undefined
  /** Read from optimistic cache data. */
  optimistic?: boolean | undefined
  /** Name of the client to use, from the provided `ApolloClients` map. */
  clientId?: string | undefined
  /** Escape hatch for any other `useFragment` option. */
  options?: useFragment.Options<TData, TVariables> | undefined
}>()

const emit = defineEmits<{
  nextState: [state: State]
}>()

const slots = defineSlots<{
  /** Opinionated mode. Providing this slot selects it, and `data` has every field. */
  data?: (props: { data: Data }) => any
  /** Shown while fields are still missing from the cache. Opinionated mode only. */
  incomplete?: (props: { data: DataValue.Partial<Data>, missing: MissingTree | undefined }) => any
  /**
   * Raw mode. Receives the flattened fragment state.
   *
   * Rendered in both modes, so nested children still mount.
   */
  default?: (props: State) => any
}>()

const isOpinionated = computed(() => slots.data != null)

// `fragment` and `from` stay outside `mergeOptions`: it widens `from` back to the
// single-or-array union, which would select the wrong `useFragment` overload.
const { current, onNextState: onState, ...rest } = useFragment<TData, TVariables>(() => ({
  ...mergeOptions<useFragment.Options<TData, TVariables>>(options, {
    fragmentName,
    variables,
    optimistic,
    clientId,
  }),
  fragment,
  from,
}))

const onNextState = onState as unknown as OnNextState
const fragmentResult = { current, onNextState, ...rest }

// `complete` narrows at runtime, but `Current`'s renamed keys do not reduce while `TData`
// is generic, so state the two shapes directly.
const completeResult = computed(() => current.value.result as Data)
const incompleteResult = computed(() => current.value.result as DataValue.Partial<Data>)
const missingFields = computed(() => current.value.missing as MissingTree | undefined)

onNextState(state => emit('nextState', state))

defineExpose(fragmentResult)
</script>

<template>
  <template v-if="isOpinionated">
    <slot v-if="current.complete" name="data" :data="completeResult" />
    <slot v-else name="incomplete" :data="incompleteResult" :missing="missingFields" />
  </template>
  <slot v-bind="current" />
</template>
