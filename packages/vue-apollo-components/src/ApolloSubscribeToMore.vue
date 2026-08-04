<script setup lang="ts" generic="TData = any, TVariables extends OperationVariables = OperationVariables">
import type { DefaultContext, ErrorLike, ObservableQuery, OperationVariables, TypedDocumentNode } from '@apollo/client'
import { equal } from '@wry/equality'
import { inject, onWatcherCleanup, shallowRef, watch, watchEffect } from 'vue'
import { ApolloQueryKey } from './keys.ts'

// The parent query's types are unknown here, so only the subscription side is typed.
type Options = ObservableQuery.SubscribeToMoreOptions<any, TVariables, TData, any>

const { document: subscriptionDocument, variables, updateQuery, context } = defineProps<{
  /** The subscription document. */
  document: TypedDocumentNode<TData, TVariables>
  // `NoInfer` so `TVariables` follows the document, not this binding.
  /** Variables for the subscription. */
  variables?: NoInfer<TVariables> | undefined
  /** Merges incoming subscription data into the parent query's result. */
  updateQuery?: Options['updateQuery'] | undefined
  /** Context passed to the link chain for this subscription. */
  context?: DefaultContext | undefined
}>()

const emit = defineEmits<{
  error: [error: ErrorLike]
}>()

const query = inject(ApolloQueryKey, null)

if (query == null) {
  throw new Error('[vue-apollo] <ApolloSubscribeToMore> must be nested inside an <ApolloQuery>.')
}

// `variables` is usually an inline literal, so key on value rather than identity.
const subscribeTo = shallowRef({ document: subscriptionDocument, variables, context })

watchEffect(() => {
  const next = { document: subscriptionDocument, variables, context }

  if (!equal(subscribeTo.value, next)) {
    subscribeTo.value = next
  }
})

// Keyed on the parent's ObservableQuery too: `useQuery` replaces it on every enabled flip
// and on `restart()`, taking its subscriptions with it. `updateQuery` is read through a
// stable callback, so changing it never re-subscribes.
watch(
  [subscribeTo, query.query],
  ([{ document, variables: subscriptionVariables, context: subscriptionContext }, observable]) => {
    if (observable == null) {
      return
    }

    const unsubscribe = query.subscribeToMore({
      document,
      variables: subscriptionVariables,
      context: subscriptionContext,
      updateQuery: (previous, options) => updateQuery?.(previous, options),
      onError: (error: ErrorLike) => emit('error', error),
    } as Options)

    onWatcherCleanup(() => unsubscribe?.())
  },
  { immediate: true },
)
</script>

<template>
  <Component :is="null" />
</template>
