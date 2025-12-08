[@vue/apollo-composable](../index.md) / useLazyQuery

# Function: useLazyQuery()

> **useLazyQuery**(`query`, `options?`): [`Result`](../@vue/namespaces/useLazyQuery/interfaces/Result.md)

A composable for executing GraphQL queries lazily (on demand).

Unlike `useQuery`, which executes immediately, `useLazyQuery` waits until `load()` is called. This is useful for queries that should only run in response to user actions (e.g., search, form submission).

## Parameters

### query

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`DocumentNode`\>

A GraphQL document.

### options?

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<[`Options`](../@vue/namespaces/useLazyQuery/interfaces/Options.md)\>

Options to control how the query is executed.

## Returns

[`Result`](../@vue/namespaces/useLazyQuery/interfaces/Result.md)

Query result object with reactive refs and `load` function.

## Example

```vue
<script setup lang="ts">
import { useLazyQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const SearchUsers = gql`query SearchUsers($term: String!) { users(search: $term) { id name } }`

const { load, result, loading } = useLazyQuery(SearchUsers)

async function search(term: string) {
  const data = await load({ term })
  console.log('Found users:', data?.users)
}
</script>

<template>
  <input @keyup.enter="search($event.target.value)">
  <div v-if="loading">
    Searching...
  </div>
  <ul v-else-if="result">
    <li v-for="user in result.users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```
