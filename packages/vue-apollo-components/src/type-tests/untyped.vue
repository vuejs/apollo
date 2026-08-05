<script setup lang="ts">
/**
 * A plain `DocumentNode` gives `TData` nothing to infer from, so it falls back to the
 * generic's `any` default. Annotating the document opts back into full checking.
 */
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import ApolloMutation from '../ApolloMutation.vue'
import ApolloQuery from '../ApolloQuery.vue'
import ApolloSubscription from '../ApolloSubscription.vue'

interface User { id: string, name: string }

const GetUsers = gql`query GetUsers($term: String!) { users { id name } }`
const AddUser = gql`mutation AddUser($name: String!) { addUser { id } }`
const OnUser = gql`subscription OnUser { userAdded { id } }`

/** Annotated by hand: no codegen, but fully typed from here on. */
const GetUsersTyped: TypedDocumentNode<{ users: User[] }, { term: string }> = gql`
  query GetUsers($term: String!) { users { id name } }
`

function expectUsers(users: User[]) {
  return users.length
}
</script>

<template>
  <!-- Untyped: `data` is `any`, so member access is allowed. -->
  <ApolloQuery :query="GetUsers" :variables="{ term: 'a' }" :empty="d => d.users.length === 0">
    <template #data="{ data }">
      {{ data.users.map((u: User) => u.name) }}
    </template>
  </ApolloQuery>

  <ApolloQuery v-slot="{ result, resultState }" :query="GetUsers">
    <p v-if="resultState === 'complete'">
      {{ result.users }}
    </p>
  </ApolloQuery>

  <ApolloMutation v-slot="{ mutate, loading }" :mutation="AddUser" :variables="{ name: 'x' }">
    <button :disabled="loading" @click="mutate()">
      add
    </button>
  </ApolloMutation>

  <ApolloSubscription :subscription="OnUser" @result="d => d.userAdded.id" />

  <!-- Annotated: back to full inference. -->
  <ApolloQuery :query="GetUsersTyped" :variables="{ term: 'a' }">
    <template #data="{ data }">
      {{ expectUsers(data.users) }}
    </template>
  </ApolloQuery>
</template>
