# Outside Components

Vue Apollo's composables rely on Vue's injection system to find the Apollo client. Inside a component's `<script setup>` (or any code that runs in a component's effect scope) the client is found through `inject(DefaultApolloClient)` automatically.

Outside of that context, `useQuery` and friends have no way to resolve a client. [`provideApolloClient`](/api/composable/functions/provideApolloClient) and [`provideApolloClients`](/api/composable/functions/provideApolloClients) bridge that gap by stashing the client in module-level state for the duration of a callback.

## When you need this

You need `provideApolloClient` when calling Vue Apollo composables from code that is **not** a component setup:

- Vue Router navigation guards (`beforeEach`, `beforeEnter`).
- Standalone scripts, utility functions, or workers.
- Test setup code that runs outside of `mount()`.

You generally do **not** need it for:

- Pinia stores. Call `useSomeStore()` from inside a component setup. The store can then use `useQuery`/`useMutation` directly because injection has already been resolved.
- Composables called from inside a component. Injection works through nested composables.
- Watch callbacks inside components. The component's effect scope is still active.

## The pattern

`provideApolloClient(client)` returns a function that runs your callback with the client available:

```ts
import { gql } from '@apollo/client'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { apolloClient } from './apollo'

const result = provideApolloClient(apolloClient)(() => {
  return useQuery(gql`
    query Me {
      me { id name }
    }
  `)
})
```

The client is bound for the duration of the inner function. Composables called inside that function resolve the client through module state instead of Vue injection.

## Vue Router guards

The canonical use case: a route guard that prefetches data before navigation.

```ts
import { gql } from '@apollo/client'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { createRouter } from 'vue-router'
import { apolloClient } from './apollo'

const router = createRouter({
  // ...routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { current, onResult, onError } = provideApolloClient(apolloClient)(() => {
      return useQuery(gql`
        query CurrentUser {
          me { id role }
        }
      `, {
        fetchPolicy: 'cache-first',
      })
    })

    // Wait for the query to complete
    await new Promise<void>((resolve) => {
      onResult(() => resolve())
      onError(() => resolve())
    })

    if (!current.value.result?.me) {
      return '/login'
    }
  }
})
```

::: warning Cleanup matters
Guards run outside any component's lifecycle, so the query has no scope to clean up against. If you start a long-running query (especially with `pollInterval` or a non-default `fetchPolicy`), it will leak.

For one-shot lookups, prefer `client.query()` directly:

```ts
const { data } = await apolloClient.query({
  query: CURRENT_USER,
  fetchPolicy: 'cache-first',
})
```

`client.query` does not subscribe and has nothing to leak. Reach for `provideApolloClient` + `useQuery` only when you need the reactive `current` ref, or when you specifically want the cache-update behavior.
:::

## Standalone helpers

For utility functions outside any Vue context (CLI tools, server scripts, workers):

```ts
import { gql } from '@apollo/client'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { apolloClient } from './apollo'

export function getUserOnce(id: string) {
  return provideApolloClient(apolloClient)(() => {
    const { onResult, onError } = useQuery(gql`
      query User($id: ID!) {
        user(id: $id) { id name }
      }
    `, {
      variables: { id },
    })

    return new Promise<any>((resolve, reject) => {
      onResult(data => resolve(data))
      onError(reject)
    })
  })
}
```

For most one-off queries, `apolloClient.query(...)` directly is simpler.

## Multiple clients

`provideApolloClients` is the dictionary variant:

```ts
import { provideApolloClients } from '@vue/apollo-composable'
import { analyticsClient, mainClient } from './apollo'

provideApolloClients({
  default: mainClient,
  analytics: analyticsClient,
})(() => {
  // useQuery, useMutation, etc. can resolve by clientId in here
})
```

See [Multiple Clients](/advanced/multiple-clients) for the full pattern.

## How it works

`provideApolloClient` writes the client into a module-level variable, runs your callback, then clears it. Vue Apollo's `useApolloClient` checks Vue's injection first; if there is no injection context (because you are not in a component), it falls back to the module-level variable.

This means:

- The client only lives for the duration of the callback.
- Nested calls work: if you call `provideApolloClient` inside `provideApolloClient`, the inner call wins until its callback returns.
- It is not thread-safe across concurrent async work, because module state is shared. Do not start two independent `provideApolloClient` blocks in parallel; chain them or use a single block.

## Next steps

- [Multiple Clients](/advanced/multiple-clients) for the named-clients pattern.
- [SSR Overview](/ssr/overview) for the SSR equivalent (cache extract/restore on the server).
- [`useApolloClient` reference](/api/composable/functions/useApolloClient) for the resolution API.
