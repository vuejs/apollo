<script setup lang="ts">
/**
 * A component whose only root node is one of ours.
 *
 * vue-tsc infers the parent's `$el` from that root, which for a component root means
 * reading `$el` off the child's instance type. Generic SFCs that call `defineExpose` lose
 * `ComponentPublicInstance` from that type under Vue language tools 2.x, so this pattern
 * fails there while passing on 3.x. Pinned here so a regression in 3.x is caught.
 */
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import ApolloQuery from '../ApolloQuery.vue'

interface User { id: string, name: string }
const GetUsers = gql`` as TypedDocumentNode<{ users: User[] }, Record<string, never>>
</script>

<template>
  <ApolloQuery :query="GetUsers">
    <template #data="{ data }">
      {{ data.users.length }}
    </template>
  </ApolloQuery>
</template>
