# Offset-based Pagination

Offset-based pagination uses an absolute index (`offset`) and a page size (`limit`):

```graphql
type Query {
  feed(offset: Int, limit: Int): [FeedItem!]!
}

type FeedItem {
  id: ID!
  message: String!
}
```

The client requests `feed(offset: 0, limit: 20)` to get the first page, then `feed(offset: 20, limit: 20)` for the next, and so on.

::: warning Stability
Offset pagination shifts when items are added or removed between fetches. If item #10 is deleted while you are viewing the first page, the first item of the second page is duplicated when you fetch it. For mutable lists, prefer [cursor-based pagination](/pagination/cursor-based).
:::

## Configuring the cache

Apollo Client ships an `offsetLimitPagination` helper for the field policy:

```ts
import { ApolloClient, InMemoryCache } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'

const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: offsetLimitPagination(),
        },
      },
    },
  }),
  // ...
})
```

The helper defines a `merge` function that concatenates pages as they arrive, so every read of `Query.feed` returns the combined list.

## Loading more with `fetchMore`

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ feed: Array<{ id: string, message: string }> }, { offset: number, limit: number }>
// ---cut---
const FEED_QUERY: TypedDocumentNode<{ feed: Array<{ id: string, message: string }> }, { offset: number, limit: number }>
  = gql`
    query Feed($offset: Int!, $limit: Int!) {
      feed(offset: $offset, limit: $limit) {
        id
        message
      }
    }
  `

const { current, fetchMore } = useQuery(FEED_QUERY, {
  variables: { offset: 0, limit: 10 },
})

function loadMore() {
  if (current.value.resultState !== 'complete')
    return

  fetchMore({
    variables: {
      offset: current.value.result.feed.length,
    },
  })
}
</script>

<template>
  <ul v-if="current.resultState === 'complete'">
    <li v-for="item in current.result.feed" :key="item.id">
      {{ item.message }}
    </li>
  </ul>
  <button @click="loadMore">
    Load more
  </button>
</template>
```

`fetchMore` uses the original query and variables, overridden by what you pass. With the `offsetLimitPagination` helper installed, the new page is appended to the cached list automatically. `current.result.feed` updates to include every item received so far.

## Key arguments

If the field accepts arguments besides `offset` and `limit` that should produce separate cached lists (for example, a `category` filter), pass them as key arguments:

```ts
const typePolicies = {
  Query: {
    fields: {
      feed: offsetLimitPagination(['type', 'userId']),
    },
  },
}
```

Pages are merged only when `type` and `userId` match. Different values mean separate cached lists, which is what you want for filtered views.

See [Apollo's `keyArgs` reference](https://www.apollographql.com/docs/react/pagination/key-args) for the full set of cases.

## Reactive variables

To use offset-based pagination with reactive variables (page-number UI), put `offset` and `limit` into refs:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { computed, ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ feed: Array<{ id: string }> }, { offset: number, limit: number }>
// ---cut---
const FEED_QUERY: TypedDocumentNode<{ feed: Array<{ id: string }> }, { offset: number, limit: number }>
  = gql`
    query Feed($offset: Int!, $limit: Int!) {
      feed(offset: $offset, limit: $limit) {
        id
      }
    }
  `

const page = ref(0)
const pageSize = 20

const { current } = useQuery(FEED_QUERY, {
  variables: {
    offset: computed(() => page.value * pageSize),
    limit: pageSize,
  },
  keepPreviousResult: true,
})
</script>

<template>
  <button :disabled="page === 0" @click="page--">
    Previous
  </button>
  <button @click="page++">
    Next
  </button>
</template>
```

This pattern replaces the page rather than appending. With `keepPreviousResult: true`, the previous page stays on screen while the new one loads.

## Refreshing all pages

When you need to refresh the entire merged list (for example after a server-side reorder), refetch the original query:

```ts
const { refetch } = useQuery(FEED_QUERY, {
  variables: { offset: 0, limit: 10 },
})

await refetch()
```

The cache is rebuilt from the new response.

## Next steps

- [Cursor-based](/pagination/cursor-based) for lists where inserts and deletions need to be handled correctly.
- [Pagination Overview](/pagination/overview) compares strategies.
- Apollo Client's [Offset-based pagination](https://www.apollographql.com/docs/react/pagination/offset-based) for the underlying field policy semantics.
