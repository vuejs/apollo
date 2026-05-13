# Cache Updates

When a mutation modifies data on the server, the local cache needs to reflect the change so the UI updates. Apollo Client handles many cases automatically, but not all. This page covers the patterns for keeping the cache in sync after a mutation.

## When the cache updates itself

If a mutation returns the modified entity (with `__typename` and the key field), Apollo Client merges it into the normalized cache automatically. Every query that reads that entity re-emits with the new value:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ updateTodo: { id: string, text: string, completed: boolean } }, { id: string, completed: boolean }>
// ---cut---
useMutation(gql`
  mutation UpdateTodo($id: ID!, $completed: Boolean!) {
    updateTodo(id: $id, completed: $completed) {
      id
      text
      completed
    }
  }
`)
```

After this mutation runs, any `useQuery` that reads `Todo:<id>` updates without extra wiring. This handles most "edit existing entity" cases for free.

The cache cannot infer:

- That a newly-created entity should appear in an existing list.
- That a deleted entity should disappear from a list.
- That a related query's result should change as a side effect.

For those, you need one of the patterns below.

## Pattern 1: Refetch queries

The simplest way to update lists after a mutation: tell Apollo which queries to refetch.

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string } }, { text: string }>
const CREATE_TODO: TypedDocumentNode<{ createTodo: { id: string } }, { text: string }> = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [
    GET_TODOS,
    'GetTodos',
  ],
})
```

Each entry is either a `DocumentNode` or a query name. You can also pass:

- `'active'` to refetch every active query in the app.
- `'all'` to refetch every query, active or inactive.
- A function `(result) => [...]` for dynamic decisions based on the mutation result.

**When to use this pattern:**

- The mutation affects multiple unrelated queries that you cannot easily enumerate.
- You want guaranteed correctness even if your `update` logic might be wrong.
- The added network roundtrip is acceptable.

**Drawback:** every listed query makes a server request, even if the mutation result alone could have updated the cache.

### Waiting for refetches to settle

By default, `mutate()` resolves as soon as the mutation completes, while refetches run in parallel. To wait until everything settles before resolving, set `awaitRefetchQueries`:

```ts
const { mutate } = useMutation(CREATE_TODO, {
  refetchQueries: [GET_TODOS],
  awaitRefetchQueries: true,
})
```

See [Refetching](/data/refetching) for more on the refetch family.

## Pattern 2: The `update` function

When you want to keep the UI in sync without an extra network call, write the change to the cache directly:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string, completed: boolean, __typename: 'Todo' } }, { text: string }>
const CREATE_TODO: TypedDocumentNode<{ createTodo: { id: string, text: string, completed: boolean, __typename: 'Todo' } }, { text: string }> = gql``
declare const GET_TODOS: TypedDocumentNode<{ todos: { id: string, text: string }[] }, {}>
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  update(cache, { data }) {
    if (!data?.createTodo)
      return

    const existing = cache.readQuery({ query: GET_TODOS })
    if (!existing)
      return

    cache.writeQuery({
      query: GET_TODOS,
      data: {
        todos: [...existing.todos, data.createTodo],
      },
    })
  },
})
```

`update` receives the cache and the mutation result. You read whatever you need, build the new state, and write it back. Apollo Client broadcasts the change to every active query that reads the affected entities, so the UI updates immediately.

### Using `cache.modify` for surgical updates

`cache.modify` is often a cleaner alternative because you do not need to read and re-write entire queries:

```ts twoslash
import { gql, TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const _gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ createTodo: { id: string, text: string, completed: boolean, __typename: 'Todo' } }, { text: string }>
const CREATE_TODO: TypedDocumentNode<{ createTodo: { id: string, text: string, completed: boolean, __typename: 'Todo' } }, { text: string }> = _gql``
// ---cut---
const { mutate } = useMutation(CREATE_TODO, {
  update(cache, { data }) {
    if (!data?.createTodo)
      return

    cache.modify({
      fields: {
        todos(existingRefs = [], { readField }) {
          const newRef = cache.writeFragment({
            data: data.createTodo,
            fragment: gql`
              fragment NewTodo on Todo {
                id
                text
                completed
              }
            `,
          })

          // Optimistic responses may fire this callback twice
          if (existingRefs.some((ref: any) => readField('id', ref) === data.createTodo.id)) {
            return existingRefs
          }

          return [...existingRefs, newRef]
        },
      },
    })
  },
})
```

For removing an item:

```ts
cache.modify({
  fields: {
    todos(existingRefs = [], { readField }) {
      return existingRefs.filter(
        (ref: any) => readField('id', ref) !== deletedId,
      )
    },
  },
})
```

Or evict the entity entirely:

```ts
cache.evict({ id: cache.identify({ __typename: 'Todo', id: deletedId }) })
cache.gc()
```

Eviction tells the cache to forget the entity. Any list that contains a reference to the evicted entity automatically drops it the next time it is read.

**When to use this pattern:**

- You can describe the cache change precisely (insert at a position, remove by ID, replace a field).
- You want the UI to update instantly without a server roundtrip.
- The cost of a wrong cache update (UI showing stale or wrong data) is acceptable, or you compensate with [refetch after update](#refetch-after-update).

## Pattern 3: Field policies (merge)

For data that always merges the same way (like pagination), define a `merge` function in your cache configuration instead of writing `update` callbacks for every mutation. This is covered in [Pagination](/pagination/overview) and the [Apollo `merge` reference](https://www.apollographql.com/docs/react/caching/cache-field-behavior#the-merge-function).

## Combining patterns

It is common to use multiple patterns together:

- **Optimistic response + update.** The optimistic response feeds the same `update` callback so the UI updates instantly, then again with the real result. See [Optimistic UI](/caching/optimistic-ui).
- **Update + refetch after update.** Do an immediate cache update for UX, then verify by refetching to catch any drift. See [Refetch after update](#refetch-after-update).

## Refetch after update

If your `update` function might get things slightly wrong, you can ask Apollo Client to refetch every query the mutation affected as a verification step. Use `onQueryUpdated`:

```ts
const { mutate } = useMutation(CREATE_TODO, {
  update(cache, { data }) {
    // ...your cache updates here
  },
  onQueryUpdated(observableQuery) {
    return observableQuery.refetch()
  },
})
```

`onQueryUpdated` is called once per active query that was affected by the cache change. Return `false` to skip, `true` to leave the query alone, or a promise (typically `observableQuery.refetch()`) to refetch.

This is a safety net. The optimistic cache update gives instant feedback; the refetch corrects any inaccuracy a moment later.

## Updating from outside a mutation

Sometimes you need to update the cache from non-mutation code (a websocket event, an interval, a state-restore on login). Reach the cache through `useApolloClient`:

```ts
import { useApolloClient } from '@vue/apollo-composable'

const { client } = useApolloClient()

client.cache.modify({
  fields: {
    todos(existingRefs = [], { readField }) {
      // ...
    },
  },
})
```

Any `useQuery` that reads the modified fields updates automatically.

## Next steps

- [Optimistic UI](/caching/optimistic-ui) makes mutations feel instant.
- [Reading & Writing](/caching/interaction) covers every cache method.
- [Refetching](/data/refetching) compares refetch patterns.
