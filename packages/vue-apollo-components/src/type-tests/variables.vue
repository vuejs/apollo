<script setup lang="ts">
/**
 * `TVariables` has to come from the document alone.
 *
 * Binding `variables` with every optional key omitted used to narrow `TVariables` to that
 * literal's shape, because it was an inference site too. Anything downstream that takes
 * the full variables then rejected the omitted keys.
 */
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import ApolloMutation from '../ApolloMutation.vue'
import ApolloQuery from '../ApolloQuery.vue'

interface Item { id: string }

const Feed = gql`` as TypedDocumentNode<{ feed: Item[] }, { cursor?: string | null, limit: number }>
const Rename = gql`` as TypedDocumentNode<{ rename: Item }, { id: string, title?: string }>
</script>

<template>
  <ApolloQuery :query="Feed" :variables="{ limit: 10 }">
    <template #data="{ data, fetchMore }">
      <!-- `cursor` was dropped from the binding, and still belongs to the variables. -->
      <button @click="fetchMore({ variables: { cursor: data.feed.at(-1)?.id ?? null, limit: 10 } })">
        more
      </button>
    </template>
  </ApolloQuery>

  <ApolloMutation v-slot="{ mutate }" :mutation="Rename" :variables="{ id: '1' }">
    <button @click="mutate({ variables: { id: '1', title: 'x' } })">
      rename
    </button>
  </ApolloMutation>
</template>
