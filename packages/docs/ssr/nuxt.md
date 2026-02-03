# Nuxt

This guide covers setting up Vue Apollo with server-side rendering (SSR) in Nuxt.

::: warning @nuxtjs/apollo Compatibility
The `@nuxtjs/apollo` module does not yet support Vue Apollo v5. This guide shows how to set up Apollo Client manually using a Nuxt plugin.
:::

## Step 1: Install Dependencies

Install Apollo Client and Vue Apollo:

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

## Step 2: Create Apollo Plugin

Create a Nuxt plugin to initialize Apollo Client with SSR support:

```ts
// app/plugins/apollo.ts
import type { NormalizedCacheObject } from '@apollo/client'
import {
  ApolloClient,
  HttpLink,
  InMemoryCache
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

    // Restore cache from server payload on client
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
      // Prevent refetching on client when we already have data
      ssrForceFetchDelay: import.meta.client ? 100 : undefined,
    })

    // Provide to Vue app
    nuxtApp.vueApp.provide(DefaultApolloClient, client)

    // Extract cache after render on server
    if (import.meta.server) {
      nuxtApp.hook('app:rendered', () => {
        nuxtApp.payload.apollo = client.extract() as NormalizedCacheObject
      })
    }
  },
})
```

This plugin:
- Creates an Apollo Client instance with SSR mode enabled on the server
- Restores the cache from the server payload on the client (hydration)
- Extracts the cache after server render and sends it to the client via the Nuxt payload

## Step 3: Use in Components

You can now use Vue Apollo composables in your components:

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
  <div>
    <div v-if="current.resultState === 'complete'">
      {{ current.result.company.ceo }}
    </div>
  </div>
</template>
```

## Next Steps

Learn more about fetching data with queries:

[Queries →](/data/queries)
