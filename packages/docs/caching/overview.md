# Caching Overview

Apollo Client stores query results in a local, normalized, in-memory cache. The cache is the reason Vue Apollo can return results instantly when the same data is queried again, and why mutations and subscriptions can update the UI without telling every component about every change.

This page introduces the cache from a Vue Apollo perspective. For deep internals (cache configuration, custom field policies, garbage collection), follow the links to the Apollo Client docs.

## What the cache buys you

When `useQuery` runs, Apollo Client:

1. Looks for the requested data in the cache.
2. If found (and `fetchPolicy` allows), returns it immediately, no network request needed.
3. If missing, sends the query, then stores the response in the cache.

Every component that uses `useQuery` for a piece of data shares the same cache entry. When that entry changes, every dependent `useQuery` updates its reactive refs automatically. You do not have to invalidate anything by hand.

## Normalization in one paragraph

Apollo Client stores objects in a flat lookup table keyed by `__typename` plus the entity's key field (usually `id`). A `User:42` and a `Post:7` each live at their own cache key. Nested objects in a response become references (`__ref: 'User:42'`). When the same `User:42` is fetched by two different queries, both reads point at the same cached object. Update one, and every query that reads it re-emits with the new value.

For a complete walkthrough, see [Apollo's Caching Overview](https://www.apollographql.com/docs/react/caching/overview).

## A reactive example

When the cache changes, queries that read the affected data refresh. The two queries below both read `Todo:5`, so the second component reflects mutations made through the first:

::: code-group

```vue [TodoList.vue]
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = useQuery(gql`
  query TodoList {
    todos {
      id        # Required for cache normalization
      text
      completed
    }
  }
`)
</script>

<template>
  <ul v-if="current.resultState === 'complete'">
    <li v-for="todo in current.result.todos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>
```

```vue [TodoDetail.vue]
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@vue/apollo-composable'

const { id } = defineProps<{ id: string }>()

const { current } = useQuery(gql`
  query TodoDetail($id: ID!) {
    todo(id: $id) {
      id
      text
      completed
    }
  }
`, { variables: { id } })

const { mutate: toggle } = useMutation(gql`
  mutation Toggle($id: ID!) {
    toggleTodo(id: $id) {
      id
      completed
    }
  }
`)
</script>

<template>
  <div v-if="current.resultState === 'complete'">
    <input
      type="checkbox"
      :checked="current.result.todo.completed"
      @change="toggle({ variables: { id } })"
    >
    {{ current.result.todo.text }}
  </div>
</template>
```

:::

After `toggle` runs, the mutation result `{ id, completed }` updates `Todo:5` in the cache. Both queries see the change immediately. No `refetchQueries`, no manual subscription.

## When the cache is not enough

The cache handles the common case automatically:

- Mutations that return the modified entity (with `__typename` and `id`).
- Queries that read the same entity from different vantage points.

It does not handle:

- **Adding to a list.** Apollo Client cannot know that a newly-created `Todo` should be appended to the `todos` query result. See [Cache Updates](/caching/cache-updates).
- **Removing from a list.** Same as above, in reverse. See [Cache Updates](/caching/cache-updates).
- **Cross-entity changes.** A mutation that affects unrelated cached data. See [Cache Updates](/caching/cache-updates).
- **Pagination merging.** Combining multiple pages of results into one list. See [Pagination](/pagination/overview).

For each of those, you describe the cache change yourself or refetch the affected queries.

## Fetch policies

`fetchPolicy` on `useQuery` controls how the cache is consulted on each call:

| Policy | Behavior |
|--------|----------|
| `cache-first` | Check cache first. Hit the network only if not cached. **(default)** |
| `cache-and-network` | Return cached data immediately, then fetch from the network and update. |
| `network-only` | Always fetch from the network, but cache the result. |
| `cache-only` | Read from the cache only. Never hit the network. |
| `no-cache` | Always fetch from the network. Do not write to the cache. |

`cache-and-network` is a useful default for screens where freshness matters but you do not want to block on the network: users see the cached result immediately, then the screen updates when the request returns.

## Configuration

Apollo Client's cache is configurable. You can tell it how to identify entities, how to merge nested fields, and how to handle pagination. The configuration lives where you create your `InMemoryCache`:

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache({
    typePolicies: {
      Todo: {
        // Use `slug` instead of `id` as the cache key
        keyFields: ['slug'],
      },
    },
  }),
})
```

For full configuration options, see Apollo Client's [Cache Configuration](https://www.apollographql.com/docs/react/caching/cache-configuration) and [Customizing field behavior](https://www.apollographql.com/docs/react/caching/cache-field-behavior).

## Visualization

The [Apollo Client Devtools](https://www.apollographql.com/docs/react/development-testing/developer-tooling#apollo-client-devtools) browser extension lets you inspect the normalized cache in real time. Highly recommended when debugging cache issues.

## Next steps

- [Reading & Writing](/caching/interaction) explains how to read from and write to the cache directly.
- [Cache Updates](/caching/cache-updates) handles the patterns the cache cannot do automatically.
- [Optimistic UI](/caching/optimistic-ui) updates the cache before the server responds.
- [Pagination](/pagination/overview) merges paginated results.
