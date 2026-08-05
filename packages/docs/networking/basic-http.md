# Basic HTTP

Apollo Client communicates with your GraphQL server through an [Apollo Link](https://www.apollographql.com/docs/react/api/link/introduction) chain. For most apps, that chain consists of one or two links wrapped around `HttpLink`.

This page covers the common HTTP setup for Vue Apollo. For richer link patterns (batching, persisted queries, custom transports), see [Apollo's Advanced HTTP networking docs](https://www.apollographql.com/docs/react/networking/advanced-http-networking).

## The minimum setup

```ts
// src/apollo.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.example.com/graphql',
  }),
  cache: new InMemoryCache(),
})
```

```ts
// src/main.ts
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApp } from 'vue'
import { apolloClient } from './apollo'
import App from './App.vue'

const app = createApp(App)
app.provide(DefaultApolloClient, apolloClient)
app.mount('#app')
```

This sends every query and mutation as an HTTP POST to the configured `uri`. Subscriptions need a separate transport: see [Subscriptions](/data/subscriptions).

## Custom headers

Pass `headers` to `HttpLink` for headers that apply to every request:

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: '/graphql',
    headers: {
      'client-name': 'WidgetX Web',
      'client-version': '1.0.0',
    },
  }),
  cache: new InMemoryCache(),
})
```

For headers that change per request (auth tokens, locale), use [Authentication](/networking/authentication) which shows how to compose `SetContextLink` with `HttpLink`.

## Credentials

By default, `HttpLink` sends credentials (cookies, basic auth) only when the GraphQL endpoint is on the same origin as the page. Override with `credentials`:

```ts
const link = new HttpLink({
  uri: '/graphql',
  credentials: 'include', // Send cookies even cross-origin
})
```

| Option | Behavior |
|--------|----------|
| `same-origin` | Send credentials only for same-origin requests. **(default)** |
| `omit` | Never send credentials. |
| `include` | Always send credentials, even cross-origin. |

If you use `include`, your server's CORS policy must allow credentials from the requesting origin.

## Composing links

`HttpLink` is the terminating link: it actually performs the HTTP request. Any links you add run before it.

The common pattern is to chain auth, error handling, retry, and the HTTP link together:

```ts
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'

const errorLink = new ErrorLink(({ error, operation }) => {
  console.error(`[Error in ${operation.operationName}]:`, error)
})

const retryLink = new RetryLink({
  attempts: { max: 3 },
})

const authLink = new SetContextLink((operation, prevContext) => ({
  ...prevContext,
  headers: {
    ...prevContext.headers,
    authorization: localStorage.getItem('token') ?? '',
  },
}))

const httpLink = new HttpLink({ uri: '/graphql' })

export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})
```

The order matters: links run from left to right on the request, and the response flows back through them in reverse. `from([a, b, c, httpLink])` means a request flows `a -> b -> c -> httpLink`, and the response flows `httpLink -> c -> b -> a`.

## Per-request context

Use the `context` option on any operation to pass per-call data through the link chain:

:::: composition-api
```ts
useQuery(QUERY, {
  context: {
    headers: {
      'x-custom-header': 'value',
    },
  },
})
```
::::

:::: components-api
`<ApolloQuery>` has no `context` prop, so pass it through `options`, which takes the whole
[`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options) object:

```vue-html
<ApolloQuery
  :query="Query"
  :options="{ context: { headers: { 'x-custom-header': 'value' } } }"
/>
```
::::

Links that read context (most auth links, persisted-query links) can use this. The context flows through every link until something acts on it.

## Custom fetch

`HttpLink` uses `globalThis.fetch` by default. To swap it (for example, to attach abort signals or instrumentation), pass `fetch`:

```ts
const link = new HttpLink({
  uri: '/graphql',
  fetch: customFetch,
})
```

The signature must match the standard Fetch API.

## Operation-name in URL

If your GraphQL server differentiates by operation name (some auth middlewares, some logging setups), enable `useGETForQueries`:

```ts
const link = new HttpLink({
  uri: '/graphql',
  useGETForQueries: true, // Queries as GET, mutations still POST
})
```

This is useful when you have edge caching that respects HTTP GET semantics.

## Next steps

- [Authentication](/networking/authentication) sets headers per request and resets the store on logout.
- [Subscriptions](/data/subscriptions) for WebSocket and SSE transports.
- Apollo Client's [Advanced HTTP networking](https://www.apollographql.com/docs/react/networking/advanced-http-networking) for batching, custom protocols, and more.
