# Installation

## Step 1: Install Dependencies

Install Apollo Client and Vue Apollo:

::: code-group

```shell [npm]
npm install @apollo/client@next @vue/apollo-composable@next graphql
```

```shell [yarn]
yarn add @apollo/client@next @vue/apollo-composable@next graphql
```

```shell [pnpm]
pnpm add @apollo/client@next @vue/apollo-composable@next graphql
```

:::

::: warning Pre-release Versions
Vue Apollo v5 requires Apollo Client 4.1+, both currently in pre-release. The `@next` tag installs the latest pre-release version.
:::

## Step 2: Create an Apollo Client

Create a file to configure your Apollo Client instance:

```ts twoslash
// src/apollo.ts
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
  cache: new InMemoryCache(),
})
```

## Step 3: Provide Apollo Client to Vue

Use Vue's provide/inject system to make Apollo Client available to all components:

```ts twoslash
// @filename: apollo.d.ts
import type { ApolloClient } from '@apollo/client'

export const apolloClient: ApolloClient

// @filename: App.vue.d.ts
import type { Component } from 'vue'

declare const comp: Component

export default comp

// @filename: main.ts
// ---cut---
// src/main.ts
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createApp } from 'vue'
import { apolloClient } from './apollo'
import App from './App.vue'

const app = createApp(App)
app.provide(DefaultApolloClient, apolloClient)
app.mount('#app')
```

That's it! You can now use [`useQuery`](/api/composable/functions/useQuery.md), [`useMutation`](/api/composable/functions/useMutation.md), and other composables in any component.

## Step 4: Your First Query

Test your setup with a simple query:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ hello: string }, {}>
// ---cut---
const { result, loading, error } = useQuery(gql`
  query Hello {
    hello
  }
`)
</script>

<template>
  <div v-if="loading">
    Loading...
  </div>
  <div v-else-if="error">
    Error: {{ error.message }}
  </div>
  <div v-else>
    {{ result?.hello }}
  </div>
</template>
```

## IDE Integration

### VS Code

Install the [Apollo GraphQL extension](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) and create `apollo.config.js`:

```js
export default {
  client: {
    service: {
      name: 'my-app',
      url: 'http://localhost:4000/graphql',
      // localSchemaFile: './path/to/schema.graphql', - instead of url
    },
    includes: ['src/**/*.vue', 'src/**/*.ts'],
  },
}
```

### WebStorm

Install the  [JS GraphQL plugin](https://plugins.jetbrains.com/plugin/8097-js-graphql/) and create `.graphqlconfig`:

```json
{
  "name": "My App",
  "schemaPath": "./schema.graphql",
  "extensions": {
    "endpoints": {
      "Default": {
        "url": "http://localhost:4000/graphql",
        "introspect": true
      }
    }
  }
}
```

## Next Steps

Now that Apollo Client is set up, learn how to fetch data:

[Queries →](/data/queries)
