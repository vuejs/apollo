# Reading & Writing to the Cache

You can read from and write to the Apollo Client cache directly, without going through the network. This is useful inside mutation `update` callbacks, for local-only fields, and from utilities or stores that need to interact with cached data.

This page focuses on the Vue Apollo context: how to access the cache and which APIs to reach for. For the full reference on each cache method, see the [Apollo Client docs on Reading and writing](https://www.apollographql.com/docs/react/caching/cache-interaction).

## Accessing the cache

There are two common contexts where you interact with the cache:

### Inside a mutation `update` callback

Apollo Client passes the cache as the first argument to `update`:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }>
const CREATE_TODO: TypedDocumentNode<{ createTodo: { id: string, text: string } }, { text: string }> = gql``
// ---cut---
useMutation(CREATE_TODO, {
  update(cache, { data }) {
    // `cache` is the ApolloCache instance
  },
})
```

### From `useApolloClient`

For anywhere else (event handlers, stores, route guards, utilities):

```ts
import { useApolloClient } from '@vue/apollo-composable'

const { client } = useApolloClient()

// client.cache is the same ApolloCache instance
client.cache.readQuery({ /* ... */ })
```

The methods below work the same way on both. Examples use `cache` interchangeably.

## Reading

### `readQuery`

Execute a GraphQL query against the cache. Returns `null` if any required field is missing:

```ts
const READ_TODO = gql`
  query ReadTodo($id: ID!) {
    todo(id: $id) {
      id
      text
      completed
    }
  }
`

const result = cache.readQuery({
  query: READ_TODO,
  variables: { id: '5' },
})

// result?.todo is fully typed if READ_TODO is a TypedDocumentNode
```

Returns `null` if the cache does not have every requested field. Does not hit the network.

::: warning Do not mutate the returned object
The same reference may be shared across components. Treat the returned data as immutable. To update cache data safely, use `writeQuery` or `cache.modify`.
:::

### `readFragment`

Read a specific entity by cache ID without composing a full query:

```ts
const TODO_FIELDS = gql`
  fragment TodoFields on Todo {
    id
    text
    completed
  }
`

const todo = cache.readFragment({
  id: 'Todo:5',
  fragment: TODO_FIELDS,
})
```

Use [`cache.identify`](#identifying-entities) to construct cache IDs from an entity object.

## Writing

### `writeQuery`

Write data into the cache shaped like a query result:

```ts
cache.writeQuery({
  query: READ_TODO,
  variables: { id: '5' },
  data: {
    todo: {
      __typename: 'Todo',
      id: '5',
      text: 'Buy grapes',
      completed: false,
    },
  },
})
```

`writeQuery` creates or merges into existing cached entities. Existing fields not mentioned in `data` are preserved.

### `writeFragment`

Write a single entity by cache ID:

```ts
cache.writeFragment({
  id: 'Todo:5',
  fragment: TODO_FIELDS,
  data: {
    __typename: 'Todo',
    id: '5',
    text: 'Updated text',
    completed: true,
  },
})
```

## Modifying with `cache.modify`

For surgical updates (changing one field, inserting into a list, removing from a list), `cache.modify` avoids reading and re-writing whole queries:

```ts
cache.modify({
  id: cache.identify({ __typename: 'Todo', id: '5' }),
  fields: {
    completed(current) {
      return !current
    },
  },
})
```

Each function receives the current field value and returns the new value. Return `DELETE` (imported from `@apollo/client/cache`) to remove a field, or `INVALIDATE` to mark it dirty so dependent queries refetch.

### Insert into a list

```ts
import { gql } from '@apollo/client'

cache.modify({
  fields: {
    todos(existingRefs = [], { readField }) {
      const newTodoRef = cache.writeFragment({
        data: newTodo,
        fragment: gql`
          fragment NewTodo on Todo {
            id
            text
            completed
          }
        `,
      })

      // Avoid duplicates (optimistic responses can fire this callback twice)
      if (existingRefs.some(ref => readField('id', ref) === newTodo.id)) {
        return existingRefs
      }

      return [...existingRefs, newTodoRef]
    },
  },
})
```

### Remove from a list

```ts
cache.modify({
  fields: {
    todos(existingRefs = [], { readField }) {
      return existingRefs.filter(
        ref => readField('id', ref) !== deletedId,
      )
    },
  },
})
```

See [Cache Updates](/caching/cache-updates) for full mutation-update patterns.

## Identifying entities

`cache.identify` returns the cache ID for an object:

```ts
const cacheId = cache.identify({ __typename: 'Todo', id: '5' })
// 'Todo:5'
```

This is the safe way to construct cache IDs because it respects any `keyFields` configuration you set in your `typePolicies`.

## Watching for changes outside components

The `useQuery` composable subscribes to cache changes automatically. If you need the same behavior outside a component setup (in a worker, a store action, an event listener), use `client.watchQuery` directly:

```ts
import { useApolloClient } from '@vue/apollo-composable'

const { client } = useApolloClient()

const observable = client.watchQuery({
  query: GET_TODOS,
  variables: { userId: '1' },
})

const subscription = observable.subscribe((next) => {
  console.log('Todos changed:', next.data)
})

// Later
subscription.unsubscribe()
observable.stop()
```

For fragment-level watching outside components, the equivalent is `client.watchFragment`. Inside a component, prefer [`useFragment`](/data/fragments).

## Deleting and invalidating

`cache.evict` removes an entity (or a field) from the cache. Pair it with `cache.gc()` to clean up unreferenced objects:

```ts
cache.evict({ id: 'Todo:5' })
cache.gc()
```

For a global "clear everything" after a logout, `client.clearStore()` removes all cached data without notifying active queries:

```ts
await client.clearStore()
```

If you want active queries to refetch after clearing, use `client.resetStore()` instead.

## Next steps

- [Cache Updates](/caching/cache-updates) covers the common mutation-update patterns.
- [Optimistic UI](/caching/optimistic-ui) uses cache writes for instant feedback.
- Apollo Client's [Reading and writing reference](https://www.apollographql.com/docs/react/caching/cache-interaction) has the full surface area for advanced cases.
