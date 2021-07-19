# Setup

确保你已经 [安装了 Apollo Client](../guide/installation.md)。

## 1. 安装 @vue/apollo-option

```
npm install --save @vue/apollo-option
```

或：

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

## 3. 注入 Apollo provider

Provider 保存了可以在接下来被所有子组件使用的 Apollo 客户端实例。

```js
import { createApolloProvider } from '@vue/apollo-option'

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
})
```

## 4. Add the provider to your app

使用 `apolloProvider` 选项将它添加到你的应用程序：

```js
import { createApp, h } from 'vue'

const app = createApp({
  render: () => h(App),
})

app.use(apolloProvider)
```

现在你已经完成了在组件中使用 Apollo 的所有准备了！
