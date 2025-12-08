[@vue/apollo-composable](../index.md) / useQuery

# Function: useQuery()

> **useQuery**(`query`, `options?`): [`Result`](../@vue/namespaces/useQuery/interfaces/Result.md) & `PromiseLike`\<[`Result`](../@vue/namespaces/useQuery/interfaces/Result.md)\>

A composable for executing GraphQL queries with full reactivity.

## Parameters

### query

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`DocumentNode`\>

A GraphQL document.

### options?

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<[`Options`](../@vue/namespaces/useQuery/interfaces/Options.md)\>

Options to control how the query is executed.

## Returns

[`Result`](../@vue/namespaces/useQuery/interfaces/Result.md) & `PromiseLike`\<[`Result`](../@vue/namespaces/useQuery/interfaces/Result.md)\>

Query result object with reactive refs.

## Example

```vue
<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const GetUser = gql`query GetUser($id: ID!) { user(id: $id) { name } }`

const { current } = useQuery(GetUser, {
  variables: { id: '1' }
})
</script>

<template>
  <div v-if="current.loading">Loading...</div>
  <div v-else-if="current.error">Error: {{ error.message }}</div>
  <div v-else>{{ result }}</div>
</template>
```
