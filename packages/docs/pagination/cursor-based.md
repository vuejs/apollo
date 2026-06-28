# Cursor-based Pagination

Cursor-based pagination uses an opaque identifier (a **cursor**) to mark a position in the list. The server returns the items after a given cursor along with a new cursor for the next page:

```graphql
type Query {
  feed(cursor: String, limit: Int!): FeedConnection!
}

type FeedConnection {
  items: [FeedItem!]!
  nextCursor: String
  hasMore: Boolean!
}

type FeedItem {
  id: ID!
  message: String!
}
```

Cursors are stable across mutations: adding or removing items between page fetches does not corrupt subsequent pages because each cursor points at a specific item, not an absolute position.

## Two flavors of cursor pagination

This page covers two common shapes:

1. **Separate cursor and items.** The response includes a `nextCursor` field alongside the items array. Recommended for most cases.
2. **Relay-style connections.** Items wrapped in `edges` with per-item cursors plus a `pageInfo` object. Useful when consuming Relay-compatible APIs.

For the underlying `merge` and `read` mechanics, see [Apollo's Cursor-based pagination](https://www.apollographql.com/docs/react/pagination/cursor-based).

## Separate cursor: configuration

A simple `merge` function appends the new items and tracks the most recent cursor:

```ts
import { ApolloClient, InMemoryCache } from '@apollo/client'

const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: {
            keyArgs: false, // Single merged list, regardless of cursor argument
            merge(existing, incoming, { readField }) {
              const items = existing ? { ...existing.items } : {}
              incoming.items.forEach((item: any) => {
                items[readField('id', item) as string] = item
              })
              return {
                nextCursor: incoming.nextCursor,
                hasMore: incoming.hasMore,
                items,
              }
            },
            read(existing) {
              if (!existing)
                return undefined
              return {
                nextCursor: existing.nextCursor,
                hasMore: existing.hasMore,
                items: Object.values(existing.items),
              }
            },
          },
        },
      },
    },
  }),
  // ...
})
```

Storing items in a map keyed by id makes duplicate handling automatic: if the same id arrives again, it overwrites itself rather than duplicating in the list.

## Separate cursor: usage

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ feed: { items: Array<{ id: string, message: string }>, nextCursor: string | null, hasMore: boolean } }, { cursor?: string | null, limit: number }>
// ---cut---
const FEED_QUERY: TypedDocumentNode<{ feed: { items: Array<{ id: string, message: string }>, nextCursor: string | null, hasMore: boolean } }, { cursor?: string | null, limit: number }>
  = gql`
    query Feed($cursor: String, $limit: Int!) {
      feed(cursor: $cursor, limit: $limit) {
        items {
          id
          message
        }
        nextCursor
        hasMore
      }
    }
  `

const { current, fetchMore } = useQuery(FEED_QUERY, {
  variables: { limit: 10 },
})

function loadMore() {
  if (current.value.resultState !== 'complete')
    return
  if (!current.value.result.feed.hasMore)
    return

  fetchMore({
    variables: {
      cursor: current.value.result.feed.nextCursor,
      limit: 10,
    },
  })
}
</script>

<template>
  <ul v-if="current.resultState === 'complete'">
    <li v-for="item in current.result.feed.items" :key="item.id">
      {{ item.message }}
    </li>
  </ul>
  <button
    v-if="current.resultState === 'complete' && current.result.feed.hasMore"
    @click="loadMore"
  >
    Load more
  </button>
</template>
```

Each call to `loadMore` passes the cursor from the previous page. Apollo merges the new items into the cached list using the `merge` function configured above.

## Relay-style connections

For APIs that follow the [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm), Apollo Client ships a helper:

```ts
import { InMemoryCache } from '@apollo/client'
import { relayStylePagination } from '@apollo/client/utilities'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        comments: relayStylePagination(),
      },
    },
  },
})
```

The helper handles `edges`, `pageInfo`, and the standard cursor naming.

Usage:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ comments: { edges: Array<{ node: { id: string, text: string } }>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } }, { cursor?: string | null }>
// ---cut---
const COMMENTS_QUERY: TypedDocumentNode<{ comments: { edges: Array<{ node: { id: string, text: string } }>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } }, { cursor?: string | null }>
  = gql`
    query Comments($cursor: String) {
      comments(first: 10, after: $cursor) {
        edges {
          node {
            id
            text
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `

const { current, fetchMore } = useQuery(COMMENTS_QUERY)

function loadMore() {
  if (current.value.resultState !== 'complete')
    return
  if (!current.value.result.comments.pageInfo.hasNextPage)
    return

  fetchMore({
    variables: {
      cursor: current.value.result.comments.pageInfo.endCursor,
    },
  })
}
</script>

<template>
  <ul v-if="current.resultState === 'complete'">
    <li v-for="edge in current.result.comments.edges" :key="edge.node.id">
      {{ edge.node.text }}
    </li>
  </ul>
  <button @click="loadMore">
    Load more
  </button>
</template>
```

## Inserting new items into a paginated list

The cache cannot tell which page a newly-created item belongs to, so a mutation does not automatically appear in the paginated list. Options:

1. Refetch the first page after creating an item.
2. Write to the cache through `cache.modify` to insert the item into the merged list directly.
3. For optimistic UI, use an `optimisticResponse` plus an `update` callback that inserts into the merged list.

See [Cache Updates](/caching/cache-updates) for the insertion patterns.

## Key arguments

If your paginated field also accepts filter or sort arguments, mark those as `keyArgs` so each filter value gets its own merged list:

```ts
const fields = {
  feed: {
    keyArgs: ['filter', 'sortOrder'],
    // ...
  },
}
```

Otherwise, switching filters would merge incompatible pages together.

## Next steps

- [Pagination Overview](/pagination/overview) compares offset and cursor strategies.
- [Offset-based](/pagination/offset-based) for the simpler offset strategy.
- Apollo Client's [Cursor-based pagination](https://www.apollographql.com/docs/react/pagination/cursor-based) for advanced `merge` and `read` patterns.
