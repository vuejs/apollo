# Refetching

Sometimes you want fresh data from the server. Refetching covers four related patterns: re-running a single query on demand, refetching specific queries after a mutation, polling, and refetching across the whole app from outside any single composable.

## Refetching a single query

Every `useQuery` exposes a `refetch` function:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string, photo: string } }, { breed: string }>
// ---cut---
const { breed } = defineProps<{ breed: string }>()

const { current, refetch } = useQuery(gql`
  query GetDogPhoto($breed: String!) {
    dog(breed: $breed) {
      id
      photo
    }
  }
`, {
  variables: () => ({ breed }),
})
</script>

<template>
  <img
    v-if="current.resultState === 'complete'"
    :src="current.result.dog.photo"
  >
  <button @click="refetch()">
    Refresh
  </button>
</template>
```

`refetch()` returns a promise that resolves with the new result.

### Refetch with different variables

You can pass new variables for a one-off refetch:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string } }, { breed: string }>
const QUERY: TypedDocumentNode<{ dog: { id: string } }, { breed: string }> = gql``
// ---cut---
const { refetch, variables } = useQuery(QUERY, {
  variables: { breed: 'bulldog' },
})

// One-time refetch with different variables
await refetch({ breed: 'poodle' })

// The reactive variables ref does not change
console.log(variables.value.breed) // 'bulldog'
```

::: warning Variables passed to `refetch` are not persisted
`refetch({ id: 2 })` uses those variables for that one request. The reactive `variables` ref keeps its previous value, and the next change to your declared `variables` (or another refetch with no args) goes back to using them.

If you want the new variables to stick, update the reactive variable source instead.
:::

## Polling

Set `pollInterval` (in milliseconds) to re-run a query at a fixed cadence:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ notifications: { id: string }[] }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetNotifications {
    notifications { id }
  }
`, {
  pollInterval: 5000, // Every 5 seconds
})
</script>
```

Polling pauses when the query is stopped, when the component is unmounted, or when `enabled` flips to `false`. It resumes when the query becomes active again.

### Skipping individual poll attempts

If you want polling to continue but occasionally skip a poll (for example, while a modal is open), use `skipPollAttempt`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY: TypedDocumentNode<{ data: string }, {}> = gql``
// ---cut---
const isModalOpen = ref(false)

useQuery(QUERY, {
  pollInterval: 5000,
  skipPollAttempt: () => isModalOpen.value,
})
```

When `skipPollAttempt` returns `true`, that one poll is skipped. The next poll runs at the normal interval.

### Imperative polling control

For full control, reach into the underlying `ObservableQuery`:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY: TypedDocumentNode<{ data: string }, {}> = gql``
// ---cut---
const { query } = useQuery(QUERY)

// Start polling
query.value?.startPolling(2000)

// Stop polling
query.value?.stopPolling()
</script>
```

`query` is a ref to the underlying [`ObservableQuery`](https://www.apollographql.com/docs/react/api/core/ObservableQuery). It is `undefined` while the query is disabled.

## Refetching after a mutation

A successful mutation often invalidates queries that display the same data. The simplest way to refresh those queries is to list them in `refetchQueries` on `useMutation`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO: TypedDocumentNode<{ createTodo: { id: string } }, { text: string }> = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [
    GET_TODOS, // by document
    'GetTodos', // or by operation name
  ],
})
```

You can also pass:

- `'active'` to refetch every currently-active query in the app.
- `'all'` to refetch every query, active or inactive.
- A function that receives the mutation result and returns an array.

::: tip Active vs inactive queries
An **active query** is one that has at least one subscriber (a mounted component or live composable). An **inactive query** has been cached but no longer has any live subscribers. Most of the time you want `'active'`, not `'all'`.
:::

### Waiting for refetches to finish

By default, `mutate` resolves as soon as the mutation completes. The triggered refetches happen in parallel. If you want `mutate` to wait until the refetches finish too, set `awaitRefetchQueries`:

```ts
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [GET_TODOS],
  awaitRefetchQueries: true,
})
```

### `onQueryUpdated`

For finer control, `onQueryUpdated` intercepts each refetch attempt. Return `false` to skip, `true` to proceed, or a promise to wait for it:

```ts
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [GET_TODOS],
  onQueryUpdated(observableQuery) {
    // Skip queries whose variables are not relevant
    if (observableQuery.queryName === 'SomeUnrelatedQuery') {
      return false
    }
    return observableQuery.refetch()
  },
})
```

This is also the way to refetch queries after an `update` callback modifies the cache. See [Cache Updates](/caching/cache-updates#refetching-after-update) for the full pattern.

## Refetching outside components

For app-wide refetches (after a logout, after a successful purchase that touches many data sources), call `client.refetchQueries` directly:

```ts
import { useApolloClient } from '@vue/apollo-composable'

const { client } = useApolloClient()

// Refetch by name or document
await client.refetchQueries({
  include: ['GetUser', GET_TODOS],
})

// Refetch every active query
await client.refetchQueries({ include: 'active' })

// Refetch queries that read a particular field
await client.refetchQueries({
  updateCache(cache) {
    cache.evict({ fieldName: 'currentUser' })
  },
})
```

The `updateCache` form is useful after a logout: evict the relevant cached fields, and `refetchQueries` automatically refetches the queries that observed them.

See the upstream [`client.refetchQueries` reference](https://www.apollographql.com/docs/react/data/refetching) for the full API.

## Refetching vs other patterns

| Goal | Tool |
|------|------|
| Pull fresh data once, on a user action (refresh button) | `refetch()` from `useQuery` |
| Stream updates continuously from the server | [Subscriptions](/data/subscriptions) |
| Keep one query in sync at a fixed cadence | `pollInterval` |
| Update queries after a mutation | `refetchQueries` on `useMutation` |
| Refetch many queries from any context | `client.refetchQueries(...)` |
| Avoid the network entirely | [Direct cache updates](/caching/cache-updates) |

## Next steps

- [Cache Updates](/caching/cache-updates) updates cache without a refetch.
- [Subscriptions](/data/subscriptions) covers real-time push updates.
- [Optimistic UI](/caching/optimistic-ui) makes the UI feel instant even before refetches complete.
