# Server-Side Rendering

Server-side rendering with Apollo Client means producing HTML on the server that already includes data fetched from your GraphQL API, then hydrating that HTML on the client without re-fetching everything.

This page covers what Vue Apollo provides for SSR, the mechanics of `awaitComplete` and `onServerPrefetch`, and a plain Vue SSR recipe. For a turnkey setup, see [Nuxt](/ssr/nuxt).

## The lifecycle

A server-rendered request goes through three phases:

1. **Render on the server.** The server creates a Vue app and an Apollo Client. Components run their `useQuery` calls. Each query fetches from the server's perspective (which can be a local data source) and populates the cache. The server renders the app to HTML.
2. **Send HTML + cache state.** The server serializes Apollo's cache state and embeds it in the HTML response. The client receives both the rendered markup and the cache snapshot.
3. **Hydrate on the client.** The client creates a fresh Apollo Client, restores the cache from the server payload, and hydrates the Vue app. Components run their `useQuery` calls again, but every result comes from the restored cache. No network requests.

Without the cache transfer, every query would re-fire on the client immediately after hydration, defeating the point of SSR.

## How Vue Apollo participates in SSR

Vue Apollo automatically integrates with two of Vue's SSR primitives:

### `onServerPrefetch`

For ordinary components (no `await` in setup), Vue Apollo registers an `onServerPrefetch` hook for each `useQuery` call. The server waits for the prefetch to resolve before rendering. The result is in the cache by the time the component renders.

This means you can write a typical Vue Apollo component and it just works in SSR. No special wrapping required.

:::: components-api
`<ApolloQuery>` server-renders the same way. `#data` is what the server emits. The two
ways of holding a query back differ here: `prefetch: false` leaves it enabled, so the
server emits `#loading`, while a `disabled` query renders nothing at all.
::::

### Top-level await with Suspense

If you use `await useQuery()` in `<script setup>`, the component becomes async. Wrapped in `<Suspense>`, the server waits for the await before rendering. This is the same pattern that produces a useful client-side loading state from [Suspense](/data/suspense).

:::: components-api
::: warning Composition API only
`<ApolloQuery>` cannot suspend. Suspense needs the `await` to happen in the *suspending*
component's own `setup`.

Use `await useQuery(...)` in `<script setup>` for the components you want to suspend, and
`<ApolloQuery>` everywhere else. They can appear in the same tree.
:::
::::

Both approaches produce a server-rendered result with real data.

## `awaitComplete` for streaming queries

By default, `useQuery` resolves as soon as the first chunk of data is available. For queries that use `@defer` or `@stream` directives, that first chunk is incomplete. If you want the server to wait for the entire response before rendering, set `awaitComplete`:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(GET_USER_WITH_POSTS, {
  variables: { id: '1' },
  awaitComplete: true,
})
</script>
```

With `awaitComplete: true`:

- SSR waits for `resultState === 'complete'` (every deferred chunk has arrived).
- Top-level `await useQuery()` similarly waits for completion.
- Client-side, the same applies to Suspense boundaries.

This negates the performance benefit of `@defer` (the whole point being to render fast and fill in slow), so reach for it only when partial data on the server would produce misleading HTML.

`onServerPrefetch` uses `awaitComplete` automatically when the `prefetch` option is enabled (which it is by default).

:::: components-api
`<ApolloQuery>` has no prop for it, so pass it through `options`, which takes the whole
[`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options) object:

```vue-html
<ApolloQuery :query="Query" :options="{ awaitComplete: true }" />
```
::::

## Plain Vue SSR recipe

For a custom SSR setup (Vinxi, raw renderToString, or a manual build), the wiring looks like this:

### Server entry

```ts
// src/entry-server.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import App from './App.vue'

export async function render() {
  const apolloClient = new ApolloClient({
    link: new HttpLink({
      uri: 'http://api.example.com/graphql', // Direct API call from the server
    }),
    cache: new InMemoryCache(),
    ssrMode: true,
  })

  const app = createSSRApp(App)
  app.provide(DefaultApolloClient, apolloClient)

  const html = await renderToString(app)
  const apolloState = apolloClient.extract()

  return { html, apolloState }
}
```

`ssrMode: true` tells Apollo Client to avoid behaviors that do not make sense on the server (like polling). `apolloClient.extract()` returns the cache state as a plain object you can serialize.

### Server template

```ts
// server.js
import { render } from 'dist-server/entry-server.js'

app.get('*', async (req, res) => {
  const { html, apolloState } = await render()

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <script>window.__APOLLO_STATE__=${JSON.stringify(apolloState).replace(/</g, '\\u003c')}</script>
      </head>
      <body>
        <div id="app">${html}</div>
        <script type="module" src="/entry-client.js"></script>
      </body>
    </html>
  `
  res.send(fullHtml)
})
```

The `<` replacement guards against XSS in the embedded state.

### Client entry

```ts
// src/entry-client.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createSSRApp } from 'vue'
import App from './App.vue'

const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache().restore(
    (window as any).__APOLLO_STATE__ ?? {},
  ),
})

const app = createSSRApp(App)
app.provide(DefaultApolloClient, apolloClient)
app.mount('#app')
```

`cache.restore(state)` rebuilds the normalized cache from the serialized snapshot. After this, the same queries that ran on the server resolve from cache on the client without a network request.

For Nuxt, see [the Nuxt guide](/ssr/nuxt) which handles all of this automatically.

## SSR pitfalls

### Hydration mismatch

If the server cache and the client cache disagree (because they hit different APIs, or because a non-deterministic field like a timestamp slipped into a query), hydration warnings appear in the console.

Fixes:

- Make sure server and client query the same endpoints.
- Avoid using local timestamps or random ids in cached values.
- For values that legitimately differ, defer them to the client (skip in SSR).

### Double-fetching after hydration

If queries re-fetch on the client immediately after hydration, the cache transfer is not being read. Check:

- The client cache is being created with `.restore()`.
- The serialized state is reaching `window.__APOLLO_STATE__` (look at the page source).
- Fetch policies are not set to `network-only` or `no-cache`, which would bypass the restored cache.

### Cache miss on the client

If the server-rendered HTML contains data but the client immediately shows a loading state, the cache likely was not transferred. Check that the serialized payload is being injected into the HTML and that `cache.restore()` runs before the app mounts.

### Avoiding network requests during SSR

If your server is hosted in the same process as your GraphQL API, `HttpLink` over the public URL is wasteful. Use [`SchemaLink`](https://www.apollographql.com/docs/react/api/link/apollo-link-schema/) to execute queries against the schema directly:

```ts
import { SchemaLink } from '@apollo/client/link/schema'
import { schema } from './schema'

const apolloClient = new ApolloClient({
  ssrMode: true,
  link: new SchemaLink({ schema }),
  cache: new InMemoryCache(),
})
```

### Skipping queries on the server

To run a query only on the client (for example, a query that depends on `window`):

:::: composition-api
```ts
import { useQuery } from '@vue/apollo-composable'

const { current } = useQuery(QUERY, {
  enabled: typeof window !== 'undefined',
})
```

Or set `prefetch: false`:

```ts
useQuery(QUERY, { prefetch: false })
```
::::

:::: components-api
```vue
<script setup lang="ts">
import { ApolloQuery } from '@vue/apollo-components'

const isClient = typeof window !== 'undefined'
</script>

<template>
  <ApolloQuery :query="Query" :disabled="!isClient" />
</template>
```

The check has to live in `<script setup>`: an SFC template resolves bare identifiers
against the component instance, so `typeof window` in the binding would always be
`'undefined'`.

Or set `prefetch: false`:

```vue-html
<ApolloQuery :query="Query" :options="{ prefetch: false }" />
```
::::

`prefetch: false` skips the `onServerPrefetch` registration but the query still executes if `enabled` is true. The component renders the loading state on the server, which the client then hydrates and resolves.

### `ssrForceFetchDelay`

When the client takes over from a server-rendered page, the cache is fresh. If you still want some queries to revalidate from the network after a short delay, configure `ssrForceFetchDelay`:

```ts
const apolloClient = new ApolloClient({
  ssrForceFetchDelay: 100, // ms
  // ...
})
```

After the delay, any query with `cache-first` fetch policy promotes itself to `cache-and-network` for one round of revalidation.

## Next steps

- [Nuxt](/ssr/nuxt) for the framework-specific recipe.
- [Suspense](/data/suspense) for the client-side counterpart.
- [Streaming & @defer](/advanced/streaming) for incremental delivery in SSR.
- Apollo's [Server-side rendering docs](https://www.apollographql.com/docs/react/performance/server-side-rendering) for the React-side reference, including `SchemaLink` patterns.
