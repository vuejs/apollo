# Streaming & @defer

The `@defer` and `@stream` directives let a GraphQL server deliver a single response in multiple chunks. The client renders the first chunk immediately and updates as later chunks arrive.

Vue Apollo surfaces this through the `current.resultState` discriminator: while data is arriving, `resultState` is `'streaming'`; when the server finishes, it becomes `'complete'`.

## When to use streaming

`@defer` is useful when a query has fast and slow fields and you want to render the fast ones first:

```graphql
query Profile($id: ID!) {
  user(id: $id) {
    id
    name        # Fast: from the user table
    ... @defer {
      activity  # Slow: aggregates from other services
    }
  }
}
```

The browser receives `name` immediately and `activity` when it is ready. Without `@defer`, the whole query is held until every field resolves.

`@stream` works the same way for lists: items arrive incrementally instead of all at once.

## Configuring the client

`@defer` and `@stream` need an incremental delivery handler on your Apollo Client instance. Without one, using either directive throws an error.

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { Defer20220824Handler } from '@apollo/client/incremental'

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: '/graphql' }),
  incrementalHandler: new Defer20220824Handler(),
})
```

Apollo Client ships several handlers, each implementing a different incremental delivery protocol:

| Handler | Protocol |
|---------|----------|
| `Defer20220824Handler` | Used by Apollo Router and earlier `graphql-yoga` versions |
| `GraphQL17Alpha2Handler` | Alias for `Defer20220824Handler` |
| `GraphQL17Alpha9Handler` | Newer `graphql` 17 alpha format |
| `NotImplementedHandler` | Default; throws on `@defer`/`@stream` |

Pick the one your server supports. See [Apollo's @defer docs](https://www.apollographql.com/docs/react/data/defer) for protocol details.

## Reading a streaming query

:::: composition-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string, name: string, activity?: Array<{ id: string, kind: string }> } }, { id: string }>
// ---cut---
const PROFILE: TypedDocumentNode<{ user: { id: string, name: string, activity?: Array<{ id: string, kind: string }> } }, { id: string }>
  = gql`
    query Profile($id: ID!) {
      user(id: $id) {
        id
        name
        ... @defer {
          activity {
            id
            kind
          }
        }
      }
    }
  `

const { current } = useQuery(PROFILE, { variables: { id: '1' } })
</script>

<template>
  <div v-if="current.resultState === 'empty'">
    Loading...
  </div>

  <div v-else>
    <!-- `name` is available as soon as the first chunk arrives -->
    <h1>{{ current.result?.user.name }}</h1>

    <!-- `activity` is available once the deferred chunk arrives -->
    <div v-if="current.result?.user.activity">
      <h2>Recent activity</h2>
      <ul>
        <li v-for="entry in current.result.user.activity" :key="entry.id">
          {{ entry.kind }}
        </li>
      </ul>
    </div>
    <div v-else>
      Loading activity...
    </div>
  </div>
</template>
```
::::

:::: components-api
`#data` renders from the first chunk onwards, so the non-deferred fields appear immediately
and the deferred ones fill in underneath as they land:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string, name: string, activity?: Array<{ id: string, kind: string }> } }, { id: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery
    :query="gql`
      query Profile($id: ID!) {
        user(id: $id) {
          id
          name
          ... @defer {
            activity {
              id
              kind
            }
          }
        }
      }
    `"
    :variables="{ id: '1' }"
  >
    <template #loading>
      Loading...
    </template>
    <template #data="{ data }">
      <!-- `name` is available as soon as the first chunk arrives -->
      <h1>{{ data.user.name }}</h1>

      <!-- `activity` is available once the deferred chunk arrives -->
      <div v-if="data.user.activity">
        <h2>Recent activity</h2>
        <ul>
          <li v-for="entry in data.user.activity" :key="entry.id">
            {{ entry.kind }}
          </li>
        </ul>
      </div>
      <div v-else>
        Loading activity...
      </div>
    </template>
  </ApolloQuery>
</template>
```

`#loading` covers only the gap before the first chunk. From there `#data` stays mounted
for the rest of the stream.

Listen for `@streamingResult` if you want each chunk imperatively, and use the default
slot when you need `resultState` itself to tell `'streaming'` from `'complete'`.
::::

The `resultState` lifecycle for a `@defer` query:

1. `'empty'` while no data has arrived.
2. `'streaming'` after the first chunk lands. `current.result` contains the non-deferred fields. Deferred fields are still `undefined`.
3. `'streaming'` continues to fire as more deferred chunks arrive. Fields appear as their chunks land.
4. `'complete'` once the server signals the response is finished. All fields are populated.

`loading` stays `true` through `streaming` and only becomes `false` at `complete`. `networkStatus` transitions from `loading` to `streaming` to `ready`.

## Type narrowing for streaming

Because deferred fields may be absent during `streaming`, their TypeScript types should reflect that. With GraphQL Codegen, this happens automatically through the `Incremental` / `Streaming` type helpers. With manual `TypedDocumentNode`, mark deferred fields as optional in your `TData` type.

:::: composition-api
Inside your component:

```ts
if (current.value.resultState === 'streaming' || current.value.resultState === 'complete') {
  // current.value.result is defined
  console.log(current.value.result.user.name)
}
```

Or be more specific:

```ts
if (current.value.resultState === 'complete') {
  // All fields, including deferred ones, are present
  console.log(current.value.result.user.activity)
}
```
::::

:::: components-api
The default slot hands you the same discriminated union, so `resultState` narrows `result`
in the template exactly as it does in script. See
[Two ways to read the result](/data/queries#two-ways-to-read-the-result) for how the two
rendering modes differ:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const Profile: TypedDocumentNode<{ user: { id: string, name: string, activity?: Array<{ id: string, kind: string }> } }, { id: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery v-slot="{ result, resultState }" :query="Profile" :variables="{ id: '1' }">
    <template v-if="resultState === 'streaming' || resultState === 'complete'">
      <!-- Non-deferred fields are there from the first chunk -->
      <h1>{{ result.user.name }}</h1>

      <!-- Deferred fields are only guaranteed once the state reaches `complete` -->
      <ul v-if="resultState === 'complete' && result.user.activity">
        <li v-for="entry in result.user.activity" :key="entry.id">
          {{ entry.kind }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```
::::

## Combining with Suspense

By default, `await useQuery()` resolves as soon as the first chunk lands. The component renders with partial data, then re-renders as more arrives.

If you want Suspense to wait for the entire stream to complete (so the first render has all the data), set `awaitComplete: true`:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(PROFILE_QUERY, {
  variables: { id: '1' },
  awaitComplete: true, // Wait for `resultState === 'complete'`
})
</script>
```

Use this carefully: it negates the latency benefit of `@defer`. Most of the time, you want the default (render fast, fill in slow) and only opt into `awaitComplete` for screens where partial data would be misleading.

:::: components-api
`awaitComplete` reaches the component through `options`, and it still governs SSR prefetch
there, so the server waits for the whole response before rendering:

```vue-html
<ApolloQuery :query="GetProfile" :options="{ awaitComplete: true }">
```

On the client it has nothing to act on, because `<ApolloQuery>` cannot suspend. The slots
render as chunks land either way. See [Suspense](/data/suspense) for why.
::::

## Refetching a streaming query

Refetching a `@defer` query goes through the streaming lifecycle again. The previous `result` stays available while the new response streams in. `networkStatus` reports `refetch` initially, then `streaming`, then `ready`.

See [Apollo's data merging tables](https://www.apollographql.com/docs/react/data/defer#loading-networkstatus-datastate-and-data-merging) for the exact transitions during refetch.

## `@stream` for lists

`@stream` works on list fields:

```graphql
query Alphabet {
  letters @stream(initialCount: 0)
}
```

:::: composition-api
The server can send letters one by one. `current.result.letters` grows as items arrive:

```ts
const { current } = useQuery(ALPHABET)

watch(() => current.value.result?.letters, (letters) => {
  console.log(letters) // ['a'], ['a', 'b'], ['a', 'b', 'c'], ...
})
```
::::

:::: components-api
The list grows in place, so a `v-for` inside `#data` simply re-renders as each chunk lands.
::::

`@stream` shares the same `resultState` transitions as `@defer`.

## Next steps

- [Suspense](/data/suspense) covers `awaitComplete` and the SSR interaction.
- [Queries](/data/queries) covers the basics of `useQuery` and `resultState`.
- Apollo's [@defer reference](https://www.apollographql.com/docs/react/data/defer) covers the full protocol.
