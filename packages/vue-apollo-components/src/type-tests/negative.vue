<script setup lang="ts">
/**
 * The positive fixtures all still compile if a generic collapses to `any`, so the inference
 * they exist to protect is only actually pinned here. Every suppression below must stay an
 * error: `vue-tsc` fails on an unused `@vue-expect-error`.
 */
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'
import ApolloFragment from '../ApolloFragment.vue'
import ApolloMutation from '../ApolloMutation.vue'
import ApolloQuery from '../ApolloQuery.vue'
import ApolloSubscription from '../ApolloSubscription.vue'

interface User { id: string, name: string }

const GetUsers = gql`` as TypedDocumentNode<{ users: User[] }, { term: string }>
const AddUser = gql`` as TypedDocumentNode<{ addUser: User }, { name: string }>
const OnUser = gql`` as TypedDocumentNode<{ userAdded: User }, { term: string }>
const UserFields = gql`` as TypedDocumentNode<User, Record<string, never>>

declare const maskedUser: { __typename: 'User', id: string }
</script>

<template>
  <!-- @vue-expect-error `term` is a string, and the document says so. -->
  <ApolloQuery :query="GetUsers" :variables="{ term: 1 }" />

  <!-- @vue-expect-error `nope` is not in the document's variables. -->
  <ApolloQuery :query="GetUsers" :variables="{ term: 'a', nope: true }" />

  <ApolloQuery :query="GetUsers" :variables="{ term: 'a' }">
    <template #data="{ data }">
      <!-- @vue-expect-error `posts` is not selected by the document. -->
      {{ data.posts }}
    </template>
  </ApolloQuery>

  <!-- @vue-expect-error `empty` returns a boolean, not a number. -->
  <ApolloQuery :query="GetUsers" :variables="{ term: 'a' }" :empty="d => d.users.length" />

  <!-- @vue-expect-error `d` is typed from the document, so `nope` does not exist. -->
  <ApolloQuery :query="GetUsers" :variables="{ term: 'a' }" :empty="d => d.nope === 0" />

  <ApolloMutation v-slot="{ mutate }" :mutation="AddUser">
    <!-- @vue-expect-error v5 takes an options object, not bare variables. -->
    <button @click="mutate({ name: 'x' })">
      add
    </button>
  </ApolloMutation>

  <ApolloMutation v-slot="{ mutate }" :mutation="AddUser">
    <!-- @vue-expect-error `name` is a string. -->
    <button @click="mutate({ variables: { name: 1 } })">
      add
    </button>
  </ApolloMutation>

  <!-- @vue-expect-error `@result` carries the subscription data, which has no `nope`. -->
  <ApolloSubscription :subscription="OnUser" :variables="{ term: 'a' }" @result="d => d.nope" />

  <ApolloFragment :fragment="UserFields" :from="maskedUser">
    <template #data="{ data }">
      <!-- @vue-expect-error the fragment selects `id` and `name` only. -->
      {{ data.email }}
    </template>
  </ApolloFragment>
</template>
