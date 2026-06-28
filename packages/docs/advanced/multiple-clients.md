# Multiple Clients

Vue Apollo supports multiple `ApolloClient` instances in the same app. The canonical use case is talking to different backends: a primary GraphQL API and an analytics service, each with its own schema, endpoint, and link chain.

This page covers the recommended pattern: provide a dictionary of named clients, then pick the right one per call with the `clientId` option.

## Setting up named clients

Create each client as you would a single client. Provide them as a dictionary through the `ApolloClients` injection key:

```ts
// src/apollo.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export const mainClient = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
  cache: new InMemoryCache(),
})

export const analyticsClient = new ApolloClient({
  link: new HttpLink({ uri: 'https://analytics.example.com/graphql' }),
  cache: new InMemoryCache(),
})
```

```ts
// src/main.ts
import { ApolloClients } from '@vue/apollo-composable'
import { createApp } from 'vue'
import { analyticsClient, mainClient } from './apollo'
import App from './App.vue'

const app = createApp(App)
app.provide(ApolloClients, {
  default: mainClient,
  analytics: analyticsClient,
})
app.mount('#app')
```

The dictionary must contain a `default` entry. That is the client used when no `clientId` is specified.

## Using a specific client

Pass `clientId` in the composable options:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ pageViews: number }, {}>
// ---cut---
const PAGE_VIEWS: TypedDocumentNode<{ pageViews: number }, {}>
  = gql`
    query PageViews {
      pageViews
    }
  `

const { current } = useQuery(PAGE_VIEWS, {
  clientId: 'analytics',
})
</script>
```

Without `clientId`, the default client handles the operation. The same option works on [`useMutation`](/data/mutations), [`useSubscription`](/data/subscriptions), [`useLazyQuery`](/advanced/lazy-queries), and [`useFragment`](/data/fragments).

## Resolving clients imperatively

For code that runs outside a composable call (event handlers, stores, route guards), use `useApolloClient` to resolve a client by id:

```ts
import { useApolloClient } from '@vue/apollo-composable'

const { resolveClient } = useApolloClient()

const analytics = resolveClient('analytics')

await analytics.mutate({
  mutation: TRACK_EVENT,
  variables: { event: 'page_view' },
})
```

`resolveClient()` with no argument returns the default client.

## Switching clients reactively

`clientId` is read each time the underlying observable is created. You can vary it based on a ref to switch clients at runtime, but the query is re-created whenever it changes, which means the previous result is lost and a new fetch starts.

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<any, any>
const QUERY: TypedDocumentNode<any, any> = gql``
// ---cut---
const env = ref<'default' | 'staging'>('default')

const { current } = useQuery(QUERY, () => ({
  clientId: env.value,
}))
```

This is fine for occasional switches (an admin tool toggling between staging and prod). For per-feature splits, prefer setting `clientId` once per component or per query, not reactively.

## Mixing with `provideApolloClient` / `provideApolloClients`

For non-component contexts (Vue Router guards, top-level scripts), use [`provideApolloClients`](/advanced/outside-components) to make named clients available the same way:

```ts
import { provideApolloClients } from '@vue/apollo-composable'

const cleanup = provideApolloClients({
  default: mainClient,
  analytics: analyticsClient,
})

const result = cleanup(() => {
  // useQuery calls in here can use clientId
  // ...
})
```

See [Outside Components](/advanced/outside-components) for the full pattern.

## When to reach for multiple clients

| Situation | Pattern |
|-----------|---------|
| One API, different auth states (anonymous vs logged in) | One client, set auth headers per request through context |
| One API, different cache policies in different parts of the app | One client, vary fetch policies per query |
| Separate backends with their own schemas | Multiple clients |
| Same backend, different versions or federated subgraphs reached separately | Multiple clients |

Multiple clients have real costs: each has its own cache, so queries against one cannot see updates to the other. If two parts of your app talk to the same entities, keep them on one client.

## Next steps

- [Outside Components](/advanced/outside-components) covers `provideApolloClient` / `provideApolloClients`.
- [Authentication](/networking/authentication) for per-request auth that does not need a separate client.
- The [`useApolloClient` reference](/api/composable/functions/useApolloClient) for the full resolution API.
