<script setup lang="ts">
/** `TData` must flow from the document prop into slot props and events. vue-tsc only. */
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import ApolloFragment from '../ApolloFragment.vue'
import ApolloMutation from '../ApolloMutation.vue'
import ApolloQuery from '../ApolloQuery.vue'
import ApolloSubscribeToMore from '../ApolloSubscribeToMore.vue'
import ApolloSubscription from '../ApolloSubscription.vue'

interface User { id: string, name: string }
const GetUsers = gql`` as TypedDocumentNode<{ users: User[] }, { term: string }>
const AddUser = gql`` as TypedDocumentNode<{ addUser: User }, { name: string }>
const OnUser = gql`` as TypedDocumentNode<{ userAdded: User }, { term: string }>
const UserFields = gql`` as TypedDocumentNode<User, Record<string, never>>

declare const maskedUser: { __typename: 'User', id: string }
declare const maskedUsers: Array<{ __typename: 'User', id: string }>

function expectUsers(users: User[]) {
  return users.length
}
</script>

<template>
  <ApolloQuery :query="GetUsers" :variables="{ term: 'a' }" :empty="d => d.users.length === 0">
    <ApolloSubscribeToMore :document="OnUser" :variables="{ term: 'a' }" />
    <template #loading>
      loading
    </template>
    <template #empty>
      none
    </template>
    <template #error="{ error, refetch }">
      {{ error.message }}{{ refetch }}
    </template>
    <template #data="{ data, isPreviousResult }">
      <p :class="{ stale: isPreviousResult }">
        {{ expectUsers(data.users) }}
      </p>
    </template>
  </ApolloQuery>

  <ApolloQuery v-slot="{ result, resultState, loading }" :query="GetUsers" :variables="{ term: 'a' }">
    <p v-if="loading">
      …
    </p>
    <p v-else-if="resultState === 'complete'">
      {{ expectUsers(result.users) }}
    </p>
  </ApolloQuery>

  <ApolloMutation v-slot="{ mutate, loading }" :mutation="AddUser" :variables="{ name: 'x' }">
    <button :disabled="loading" @click="mutate()">
      add
    </button>
  </ApolloMutation>

  <!-- Single entity: `#data` is the fragment's own type. -->
  <ApolloFragment :fragment="UserFields" :from="maskedUser">
    <template #incomplete="{ data, missing }">
      {{ data.id }}{{ missing }}
    </template>
    <template #data="{ data }">
      {{ data.name }}
    </template>
  </ApolloFragment>

  <!-- Many entities: one component per item, so each gets its own complete/incomplete. -->
  <ApolloFragment v-for="user in maskedUsers" :key="user.id" :fragment="UserFields" :from="user">
    <template #data="{ data }">
      {{ data.name }}
    </template>
  </ApolloFragment>

  <ApolloSubscription
    :subscription="OnUser"
    :variables="{ term: 'a' }"
    @result="d => d.userAdded.name"
  />
</template>
