# Queries

This page shows how to fetch GraphQL data in Vue with the [`useQuery`](/api/composable/functions/useQuery) composable.

## Executing a query

Call `useQuery` inside `<script setup>` and pass a GraphQL document:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dogs: { id: string, breed: string }[] }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.error">
    Error: {{ current.error.message }}
  </div>
  <ul v-else-if="current.resultState === 'complete'">
    <li v-for="dog in current.result.dogs" :key="dog.id">
      {{ dog.breed }}
    </li>
  </ul>
</template>
```

`useQuery` returns a `current` ref. Its value is a discriminated union with `result`, `resultState`, `loading`, `networkStatus`, and `error` properties.

### Why we recommend `current`

`useQuery` exposes the same information in two shapes: a single `current` ref containing the discriminated union, and individual refs like `result`, `loading`, `error` that you can destructure separately.

We recommend `current` for any code that reads `result`. The `resultState` field narrows the type of `result`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { name: string } }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetUser {
    user { name }
  }
`)

if (current.value.resultState === 'complete') {
  // current.value.result is typed as { user: { name: string } }
  console.log(current.value.result.user.name)
}
```

The individual refs work, but `result.value` is always typed as `TData | undefined` without context. Reading `current` keeps loading, network status, and data narrowing in one place.

The standalone refs (`result`, `loading`, `error`, `networkStatus`) remain available for cases where you only care about one of them and do not need to access `result`.

## Variables

Pass variables in the options object:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string, name: string } }, { breed: string }>
// ---cut---
const breed = ref('bulldog')

const { current } = useQuery(gql`
  query GetDog($breed: String!) {
    dog(breed: $breed) {
      id
      name
    }
  }
`, {
  variables: { breed },
})
</script>
```

When `breed.value` changes, the query re-executes with the new value.

`variables` accepts three shapes:

1. **An object with reactive values per key** (shown above). Each value can be a ref, a getter, or a plain value.
2. **A ref or getter that returns the whole variables object.** Useful when you compute the variables from other reactive state.
3. **A plain object.** Static variables, no reactivity.

### Variables as a getter

For props or values that change over time, a getter avoids losing reactivity:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string } }, { breed: string }>
// ---cut---
const { breed } = defineProps<{ breed: string }>()

const { current } = useQuery(gql`
  query GetDog($breed: String!) {
    dog(breed: $breed) { id }
  }
`, {
  variables: () => ({ breed }),
})
</script>
```

### Throttle and debounce

For inputs that update rapidly (search boxes, sliders), `throttle` and `debounce` reduce how often the query re-executes:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ search: { id: string }[] }, { q: string }>
const SEARCH = gql``
// ---cut---
const term = ref('')

const { current } = useQuery(SEARCH, {
  variables: { q: term },
  debounce: 300, // wait 300ms after the last change before re-executing
})
```

Use `throttle` to cap the rate, `debounce` to wait for keystrokes to settle. They are mutually exclusive.

## Caching

Apollo Client caches query results in a normalized in-memory cache. When you execute the same query again with the same variables, the result comes back instantly from the cache.

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string, photo: string } }, { breed: string }>
// ---cut---
const { breed } = defineProps<{ breed: string }>()

// First call with this breed: hits the network.
// Subsequent calls with the same breed: returns from cache.
const { current } = useQuery(gql`
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
```

Read [Caching Overview](/caching/overview) to understand cache behavior in depth.

## Loading states

`current.loading` is `true` while the query is in flight:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.resultState === 'complete'">
    {{ current.result }}
  </div>
</template>
```

For more granular control, use `current.networkStatus`:

```vue twoslash
<script setup lang="ts">
import { NetworkStatus, TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.networkStatus === NetworkStatus.refetch">
    Refetching...
  </div>
</template>
```

For loading indicators that aggregate multiple queries, see [Loading States](/advanced/loading-states).

## Error handling

`current.error` contains any error that occurred:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.error" class="error">
    {{ current.error.message }}
  </div>
</template>
```

For comprehensive error handling (error policies, partial data, classifying error types), see [Error Handling](/data/error-handling).

## Fetch policies

`fetchPolicy` controls how the query interacts with the cache:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { current } = useQuery(QUERY, {
  fetchPolicy: 'network-only',
})
```

| Policy | Description |
|--------|-------------|
| `cache-first` | Check cache first. Hit the network only if not cached. **(default)** |
| `cache-and-network` | Return cached data immediately, then fetch from the network and update. |
| `network-only` | Always fetch from the network, but cache the result. |
| `cache-only` | Read from the cache only. Never hit the network. |
| `no-cache` | Always fetch from the network. Do not write to the cache. |

`nextFetchPolicy` lets you switch to a different policy after the first request completes. `initialFetchPolicy` resets to a specific policy when variables change. See [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options) for details.

## Disabling queries

Set `enabled: false` to skip execution until a condition is met:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string } }, { id: string }>
// ---cut---
const { userId } = defineProps<{ userId?: string }>()

const { current } = useQuery(
  gql`
    query GetUser($id: ID!) {
      user(id: $id) { id }
    }
  `,
  () =>
    userId == null
      ? { enabled: false }
      : { variables: { id: userId } },
)
</script>
```

While `enabled` is `false`, no observable query exists. When `enabled` flips to `true`, the query starts and behaves like any other `useQuery` from that point on.

For queries that run in response to a user action (search submit, button click), prefer [`useLazyQuery`](/advanced/lazy-queries) instead.

## Event hooks

React to query lifecycle events imperatively:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { onNextState, onResult, onError } = useQuery(QUERY)

// Fires on every state change (loading, network status, result)
onNextState((state) => {
  console.log('State:', state.resultState, state.loading)
})

// Fires when result data arrives (complete, partial, or streaming)
onResult((data) => {
  console.log('Data received:', data)
})

// Fires when an error occurs
onError((error) => {
  console.error('Query failed:', error)
})
```

`onResult` has three variants you can listen to individually: `onCompleteResult`, `onPartialResult`, and `onStreamingResult`. The plain `onResult` fires for all three.

## Keeping previous data

When variables change, `result` is cleared by default while the new request is in flight. Set `keepPreviousResult: true` to keep showing the previous data until the new data arrives:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, { id: string }>
const QUERY = gql``
// ---cut---
const id = ref('1')

const { current } = useQuery(QUERY, {
  variables: { id },
  keepPreviousResult: true,
})
// When id changes, current.result keeps the old value
// until the new query completes.
```

This pattern is useful for filters and pagination, where flashing an empty state on every change would be jarring.

A retained result is reported as a normal result: `resultState`, `result` and `partial` all describe the data you are still showing, so narrowing on `resultState === 'complete'` keeps working. `isPreviousResult` tells the two apart, and `loading` describes the request that is on its way to replace it:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string, name: string }[] }, { term: string }>
const SearchProducts = gql``
// ---cut---
const term = ref('')

const { current } = useQuery(SearchProducts, {
  variables: { term },
  keepPreviousResult: true,
})
</script>

<template>
  <ul v-if="current.resultState === 'complete'" :class="{ stale: current.isPreviousResult }">
    <li v-for="product in current.result.products" :key="product.id">
      {{ product.name }}
    </li>
  </ul>
  <p v-else-if="!current.loading">
    No products found.
  </p>
</template>
```

`resultState` describes the data being handed back; `loading`, `networkStatus` and `error` describe the request. Retention only ever changes the former.

## Loading and the debounce window

`loading` is `true` from the moment the query accepts new variables, not from the moment the request goes out. With `debounce` or `throttle`, that includes the window where the timer has not yet elapsed — so a search-as-you-type field shows a spinner on the keystroke rather than after the delay:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ products: { id: string }[] }, { term: string }>
const SearchProducts = gql``
// ---cut---
const term = ref('')

const { loading, pending } = useQuery(SearchProducts, {
  variables: { term },
  debounce: 300,
})
// loading: true from the keystroke until the results land
// pending: true only while the debounce timer is running
```

`pending` separates the two halves for the cases that need it (request metrics, cancel affordances). `networkStatus` describes the network alone and stays `ready` throughout the debounce window, so `loading` is deliberately broader than `networkStatus < 7`: it also spans the hand-over where the variables have been accepted but the request has not gone out yet.

Variables that are rebuilt with deeply equal contents never report as pending, since no request will follow. Neither do variables that change and change back before the timer elapses.

## Awaiting the query

`useQuery` returns a `PromiseLike` that resolves when initial data is available. Combined with `<Suspense>`, this gives you a server-rendered initial state and a unified loading fallback:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(gql`
  query GetUsers {
    users { id name }
  }
`)
</script>
```

See [Suspense](/data/suspense) for the full pattern, including SSR and streaming considerations.

## Options and result reference

For every available option and method, see:

- [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options)
- [`useQuery.Result`](/api/composable/@vue/namespaces/useQuery/interfaces/Result)

## Next steps

- [Refetching](/data/refetching) re-execute queries on demand or on a schedule.
- [Lazy Queries](/advanced/lazy-queries) run queries in response to user actions.
- [Mutations](/data/mutations) update data and reflect the changes in your queries.
- [Error Handling](/data/error-handling) classify and recover from errors.
