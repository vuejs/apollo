<script setup lang="ts">
/**
 * Kebab-case event names and handler references must both typecheck.
 *
 * Our own code and examples spell events the way they are declared, but consumers are free
 * to hyphenate, so that form has to keep resolving. Hence the rule is off for this file
 * rather than the fixture being rewritten.
 */
import type { ErrorLike, TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import ApolloQuery from '../ApolloQuery.vue'

const GetDogs = gql`` as TypedDocumentNode<{ dogs: { id: string }[] }, Record<string, never>>

declare function report(error: ErrorLike): void
</script>

<!-- eslint-disable vue/v-on-event-hyphenation -->
<template>
  <ApolloQuery
    :query="GetDogs"
    @error="report"
    @next-state="state => state.resultState"
    @complete-result="data => data.dogs.length"
  >
    <template #data="{ data }">
      {{ data.dogs.length }}
    </template>
  </ApolloQuery>
</template>
