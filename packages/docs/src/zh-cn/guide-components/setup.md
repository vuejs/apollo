# Setup

确保你已经 [安装了 Apollo Client](../guide/installation.md)。

## 1. 安装 @vue/apollo-components

```
npm install --save @vue/apollo-option @vue/apollo-components
```

或：

```
yarn add @vue/apollo-option @vue/apollo-components
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

## 5. Add the components to your app

```js
import VueApolloComponents from '@vue/apollo-components'

// ...

app.use(VueApolloComponents)
```

现在你已经完成了在组件中使用 Apollo 的所有准备了！
