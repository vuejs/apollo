# Setup

Make sure you have [installed Apollo Client](../guide/installation.md).

## 1. Install @vue/apollo-option

```
npm install --save @vue/apollo-option
```

Or:

```
yarn add @vue/apollo-option
```

## 2. Create the Apollo client

```js
import { ApolloClient, InMemoryCache } from '@apollo/client/core'

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  cache,
  uri: 'http://localhost:4042/graphql',
})

```

::: warning
Use the `@apollo/client/core` import path otherwise you will also import React.
:::

## 3. Create the Apollo provider

The provider holds the Apollo client instances that can then be used by all the child components.

```js
import { createApolloProvider } from '@vue/apollo-option'

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})
```

## 4. Add the provider to your app

Add it to your app with the `app.use` function:

```js
import { createApp, h } from 'vue'

const app = createApp({
  render: () => h(App),
})

app.use(apolloProvider)
```

You are now ready to use Apollo in your components!
