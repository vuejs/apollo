# Pagination Overview

GraphQL queries fetch exactly the fields you need. When those fields contain large lists, you split them into pages instead of returning everything at once. This page covers the building blocks Vue Apollo provides for paginated lists.

## The pagination problem

A query like:

```graphql
query GetBookTitles {
  books {
    title
  }
}
```

might return thousands of books. Pagination splits that into chunks:

```graphql
query GetBookTitles($offset: Int!, $limit: Int!) {
  books(offset: $offset, limit: $limit) {
    title
  }
}
```

The client decides which page to fetch by providing pagination arguments. Apollo Client's job is to merge those pages into a coherent cached list so your UI can render one continuous feed without re-fetching previous pages every time.

## Pagination strategies

Two patterns are common:

- **Offset-based** uses absolute positions (`offset: 0, limit: 10`, then `offset: 10, limit: 10`). Simple, but unstable when items move or are deleted between fetches. See [Offset-based](/pagination/offset-based).
- **Cursor-based** uses opaque cursors that the server provides for each item. Stable under inserts and deletions because cursors refer to specific items, not positions. See [Cursor-based](/pagination/cursor-based).

Other variants (page-number, Relay-style connections, infinite scroll vs explicit "next page") all reduce to one of these underlying patterns.

## How Apollo handles pagination

Apollo Client does not prescribe a strategy. Instead, you describe how to merge the cached field through a `typePolicies` configuration:

```ts
import { InMemoryCache } from '@apollo/client'
import { offsetLimitPagination } from '@apollo/client/utilities'

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        feed: offsetLimitPagination(), // Built-in helper
      },
    },
  },
})
```

The `merge` function in the field policy decides how a new page combines with what is already cached. Apollo ships helpers for the two common strategies; for anything custom, you can write your own `merge` function. See the [Apollo Pagination Core API](https://www.apollographql.com/docs/react/pagination/core-api).

## Loading the next page

:::: composition-api
Vue Apollo's [`useQuery`](/api/composable/functions/useQuery) returns a `fetchMore` function for loading the next page:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

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
      limit: 10,
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
::::

:::: components-api
`fetchMore` is a `#data` slot prop, and inside `#data` the list is guaranteed to exist, so
the offset can be computed inline with no guard:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const Feed: TypedDocumentNode<{ feed: Array<{ id: string, message: string }> }, { offset: number, limit: number }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery :query="Feed" :variables="{ offset: 0, limit: 10 }">
    <template #loading>
      Loading...
    </template>
    <template #data="{ data, loading, fetchMore }">
      <ul>
        <li v-for="item in data.feed" :key="item.id">
          {{ item.message }}
        </li>
      </ul>
      <button
        :disabled="loading"
        @click="fetchMore({ variables: { offset: data.feed.length, limit: 10 } })"
      >
        Load more
      </button>
    </template>
  </ApolloQuery>
</template>
```

The `variables` prop stays at the *first* page throughout. `fetchMore` does not change it.
::::

When you call `fetchMore`, Apollo:

1. Sends a query with the new variables.
2. Merges the result with the cached value using the field policy's `merge` function.
3. Notifies any active query that reads the field, including this one. The rendered list updates with the merged value.

You typically want the `offsetLimitPagination` helper (or a cursor equivalent) configured for the field, otherwise `merge` defaults to replacing the cached value with the new page.

## With reactive variables

If you keep pagination state in a Vue ref, the query re-executes when it changes. This is useful for "paginate by setting the page number" UIs:

:::: composition-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { computed, ref } from 'vue'

declare const FEED_QUERY: TypedDocumentNode<{ feed: Array<{ id: string }> }, { offset: number, limit: number }>
// ---cut---
const page = ref(0)
const pageSize = 20

const { current } = useQuery(FEED_QUERY, {
  variables: {
    offset: computed(() => page.value * pageSize),
    limit: pageSize,
  },
  keepPreviousResult: true, // Show the previous page until the new one arrives
})
</script>

<template>
  <button @click="page--">
    Previous
  </button>
  <button @click="page++">
    Next
  </button>
</template>
```

For paginated lists you typically want `keepPreviousResult: true` so the list does not blink to empty between pages.
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const Feed: TypedDocumentNode<{ feed: Array<{ id: string, message: string }> }, { offset: number, limit: number }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
import { ref } from 'vue'

const page = ref(0)
const pageSize = 20
</script>

<template>
  <ApolloQuery
    :query="Feed"
    :variables="{ offset: page * pageSize, limit: pageSize }"
    keepPreviousResult
  >
    <template #data="{ data, isPreviousResult }">
      <ul :class="{ stale: isPreviousResult }">
        <li v-for="item in data.feed" :key="item.id">
          {{ item.message }}
        </li>
      </ul>
    </template>
  </ApolloQuery>

  <button :disabled="page === 0" @click="page--">
    Previous
  </button>
  <button @click="page++">
    Next
  </button>
</template>
```

For paginated lists you almost always want `keepPreviousResult`, so the list does not
blink to empty between pages. It is off by default. See
[Keeping previous data](/data/queries#keeping-previous-data).
::::

::: tip `fetchMore` vs reactive variables
Use `fetchMore` when you want to grow an in-place list (infinite scroll, "load more" button). Use reactive variables when each page replaces the previous one (numbered pagination, "next page" navigation).
:::

## Mutations that affect lists

After a mutation adds or removes an item from a paginated list, the cache does not know which page the item belongs to. You typically reach for either:

- A custom `update` callback on the mutation that inserts or removes the entity from the merged list. See [Cache Updates](/caching/cache-updates).
- `refetchQueries` to refetch the affected list query.

For lists where order matters and the server controls it (chronological feeds, server-side sort), `refetchQueries` is usually more reliable.

:::: components-api
[`<ApolloMutation>`](/api/components/ApolloMutation) has props only for `mutation`,
`variables` and `clientId`. Both `update` and `refetchQueries` reach `useMutation` through
the `options` prop, which takes the full
[`useMutation.Options`](/api/composable/@vue/namespaces/useMutation/interfaces/Options)
object:

```vue-html
<ApolloMutation
  v-slot="{ mutate }"
  :mutation="AddFeedItem"
  :options="{ refetchQueries: [Feed], update: insertIntoFeed }"
  @error="console.error"
>
  <button @click="mutate({ variables: { message } })">
    Add
  </button>
</ApolloMutation>
```
::::

## Next steps

- [Offset-based](/pagination/offset-based) details the offset/limit pattern.
- [Cursor-based](/pagination/cursor-based) details the cursor pattern.
- Apollo Client's [Pagination Core API](https://www.apollographql.com/docs/react/pagination/core-api) explains `merge`, `keyArgs`, and `read` functions in depth.
