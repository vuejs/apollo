# Queries

This page shows how to fetch GraphQL data in Vue with the [`useQuery`](/api/composable/functions/useQuery) composable and attach the result to your UI.

## Executing a Query

The [`useQuery`](/api/composable/functions/useQuery) composable is the primary way to execute queries. Call it in your component's `<script setup>` and pass a GraphQL document:

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

When your component renders, [`useQuery`](/api/composable/functions/useQuery) returns a [`current`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#current) ref containing a discriminated union with [`loading`](/api/composable/@vue/namespaces/useQuery/interfaces/Current.md#loading), [`error`](/api/composable/@vue/namespaces/useQuery/interfaces/Current.md#error), [`result`](/api/composable/@vue/namespaces/useQuery/interfaces/Current.md#result), and [`resultState`](/api/composable/@vue/namespaces/useQuery/interfaces/Current.md#resultState) properties. Using [`current`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#current) provides better type narrowing—when you check `current.resultState === 'complete'`, TypeScript knows `current.result` is defined.

Each property is also available as an individual ref ([`result`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#result), [`loading`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#loading), [`error`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#error)), but we recommend using [`current`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#current) for type-safety.

## Variables

Pass variables in the options object. The `variables` option accepts a plain object, a reactive object, or a getter function:

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
  variables: {
    breed,
  },
})
</script>
```

When `breed` changes, the query automatically re-executes with the new value.

### Variables as a Getter

For props or computed values, use a getter function:

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
  variables: () => ({
    breed,
  }),
})
</script>
```

## Caching

Apollo Client automatically caches query results. When you execute the same query again, it returns cached data instantly without a network request.

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string, photo: string } }, { breed: string }>
// ---cut---
const { breed } = defineProps<{ breed: string }>()

// First time: fetches from network
// Second time with same breed: returns from cache instantly
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

Learn more about caching in the [Caching Overview](/caching/overview).

## Updating Cached Data

### Polling

Poll the server at a fixed interval:

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
  pollInterval: 5000, // Poll every 5 seconds
})
</script>
```

Control polling dynamically:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { query } = useQuery(QUERY)

// Start polling every 2 seconds
query.value?.startPolling(2000)

// Stop polling
query.value?.stopPolling()
</script>
```

### Refetching

Manually refetch in response to user actions:

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

Pass new variables to `refetch`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ dog: { id: string } }, { breed: string }>
const QUERY = gql``
// ---cut---
const { refetch } = useQuery(QUERY, { variables: { breed: 'bulldog' } })

// Refetch with different variables
refetch({ breed: 'poodle' })
```

## Loading States

The `current.loading` property indicates when a query is in flight:

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
const { current, refetch } = useQuery(QUERY)
</script>

<template>
  <div v-if="current.networkStatus === NetworkStatus.refetch">
    Refetching...
  </div>
</template>
```

## Error Handling

The `current.error` property contains any error that occurred:

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

For comprehensive error handling including partial data, see [Error Handling](/data/error-handling).

## Fetch Policies

Control how the query interacts with the cache using `fetchPolicy`:

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
| `cache-first` | Check cache first. Fetch from network only if not in cache. **(default)** |
| `cache-and-network` | Return cache immediately, then fetch from network and update. |
| `network-only` | Always fetch from network, but cache the result. |
| `cache-only` | Only read from cache, never fetch from network. |
| `no-cache` | Always fetch from network, don't cache the result. |

## Disabling Queries

Prevent a query from executing with the `enabled` option:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'

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
      : {
          variables: { id: userId },
        }
)
</script>
```

The query won't execute until `enabled` becomes `true`.

## Event Hooks

React to query lifecycle events:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ data: string }, {}>
const QUERY = gql``
// ---cut---
const { onNextState, onResult, onError } = useQuery(QUERY)

// Called on every state change with the full current object
onNextState((current) => {
  console.log('State:', current.resultState, current.loading)
})

// Called when result is available (complete, partial, or streaming)
onResult((result) => {
  console.log('Data received:', result.data)
})

// Called when an error occurs
onError((error) => {
  console.error('Query failed:', error)
})
```

## Next Steps

- [Mutations](/data/mutations) - Learn how to update data
- [Lazy Queries](/advanced/lazy-queries) - Execute queries on demand
- [Error Handling](/data/error-handling) - Handle errors gracefully
