# Nuxt

This guide sets up Vue Apollo with server-side rendering in Nuxt. For the conceptual model of SSR with Apollo Client, see [SSR Overview](/ssr/overview).

::: warning @nuxtjs/apollo compatibility
The `@nuxtjs/apollo` module does not yet support Vue Apollo v5. This guide configures Apollo Client manually through a Nuxt plugin.
:::

## Step 1: Install dependencies

::: code-group

```shell [npm]
npm install @apollo/client @vue/apollo-composable@next graphql
```

```shell [yarn]
yarn add @apollo/client @vue/apollo-composable@next graphql
```

```shell [pnpm]
pnpm add @apollo/client @vue/apollo-composable@next graphql
```

:::

## Step 2: Create the Apollo plugin

Create a Nuxt plugin that creates the client, restores the cache on the client side, and extracts it on the server side:

```ts
// app/plugins/apollo.ts
import type { NormalizedCacheObject } from '@apollo/client'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from '@apollo/client'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { defineNuxtPlugin } from 'nuxt/app'

declare module 'nuxt/app' {
  interface NuxtPayload {
    apollo?: NormalizedCacheObject
  }
}

export default defineNuxtPlugin({
  name: 'apollo',
  enforce: 'pre',

  setup(nuxtApp) {
    const cache = new InMemoryCache()

    // On the client, restore the cache from the server payload
    if (import.meta.client && nuxtApp.payload.apollo) {
      cache.restore(nuxtApp.payload.apollo)
    }

    const httpLink = new HttpLink({
      uri: 'https://example.com/graphql',
    })

    const client = new ApolloClient({
      link: httpLink,
      cache,
      ssrMode: import.meta.server,
      // After hydration, give the client a moment before revalidating cached queries
      ssrForceFetchDelay: import.meta.client ? 100 : undefined,
    })

    nuxtApp.vueApp.provide(DefaultApolloClient, client)

    // On the server, extract the cache after rendering and ship it to the client
    if (import.meta.server) {
      nuxtApp.hook('app:rendered', () => {
        nuxtApp.payload.apollo = client.extract() as NormalizedCacheObject
      })
    }
  },
})
```

What this does:

- Creates an Apollo Client in both server and client contexts.
- On the server, `ssrMode: true` disables polling and other client-only behaviors.
- On the client, `cache.restore` replays the server's cache state so queries resolve from the cache without a network request.
- The `app:rendered` hook serializes the cache into Nuxt's payload after server rendering.
- `ssrForceFetchDelay` lets cached queries revalidate from the network shortly after hydration, useful for slightly stale data.

## Step 3: Use the composables

In any page or component:

```vue
<script setup>
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = useQuery(gql`
  query {
    company {
      ceo
    }
  }
`)
</script>

<template>
  <div v-if="current.resultState === 'complete'">
    {{ current.result.company.ceo }}
  </div>
</template>
```

`useQuery` registers an `onServerPrefetch` hook automatically, so Nuxt waits for the data before rendering the page. The result is in HTML, and the client hydrates without a re-fetch.

## Awaiting queries with Suspense

For pages that should block rendering until data is available, use top-level `await`:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(gql`
  query {
    company {
      ceo
    }
  }
`)
</script>
```

Nuxt wraps pages in `<Suspense>` automatically, so this works without extra setup. See [Suspense](/data/suspense) for the full pattern.

## Authentication in Nuxt

For per-request auth (cookies, server-side tokens from `useRequestHeaders`), pass the headers into `HttpLink` when creating the client:

```ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { defineNuxtPlugin, useRequestHeaders } from 'nuxt/app'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}

    const cache = new InMemoryCache()
    if (import.meta.client && nuxtApp.payload.apollo) {
      cache.restore(nuxtApp.payload.apollo)
    }

    const client = new ApolloClient({
      link: new HttpLink({
        uri: 'https://example.com/graphql',
        headers,
        credentials: 'include',
      }),
      cache,
      ssrMode: import.meta.server,
    })

    nuxtApp.vueApp.provide(DefaultApolloClient, client)

    if (import.meta.server) {
      nuxtApp.hook('app:rendered', () => {
        nuxtApp.payload.apollo = client.extract()
      })
    }
  },
})
```

This forwards cookies from the incoming request to your GraphQL backend during SSR. On the client, `credentials: 'include'` sends them normally.

For more elaborate auth flows (token refresh, ErrorLink retries), see [Authentication](/networking/authentication).

## Subscriptions in Nuxt

Subscriptions are client-only. The cleanest pattern is to construct the SSE or WebSocket link only on the client:

```ts
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { OperationTypeNode } from 'graphql'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin({
  setup(nuxtApp) {
    const cache = new InMemoryCache()
    if (import.meta.client && nuxtApp.payload.apollo) {
      cache.restore(nuxtApp.payload.apollo)
    }

    const httpLink = new HttpLink({ uri: 'https://example.com/graphql' })

    let link = httpLink as ApolloLink

    if (import.meta.client) {
      // Client only: set up subscription transport
      const { GraphQLWsLink } = await import('@apollo/client/link/subscriptions')
      const { createClient } = await import('graphql-ws')

      const wsLink = new GraphQLWsLink(
        createClient({ url: 'wss://example.com/graphql' }),
      )

      link = ApolloLink.split(
        ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
        wsLink,
        httpLink,
      )
    }

    const client = new ApolloClient({
      link,
      cache,
      ssrMode: import.meta.server,
    })

    nuxtApp.vueApp.provide(DefaultApolloClient, client)

    if (import.meta.server) {
      nuxtApp.hook('app:rendered', () => {
        nuxtApp.payload.apollo = client.extract()
      })
    }
  },
})
```

See [Subscriptions](/data/subscriptions) for the full transport options.

## Next steps

- [SSR Overview](/ssr/overview) for the conceptual model and plain-Vue recipe.
- [Authentication](/networking/authentication) for token and cookie patterns.
- [Subscriptions](/data/subscriptions) for real-time transport setup.
- [Queries](/data/queries) for the basics.
