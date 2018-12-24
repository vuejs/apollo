# 安装

## Vue CLI 插件

我为 [vue-cli](http://cli.vuejs.org) 制作了一个插件，因此仅用两分钟你就可以添加 Apollo（附带一个可选的 GraphQL 服务器）！✨🚀

在你的 vue-cli 3 项目中：

```bash
vue add apollo
```

然后你可以跳到下一部分：[基本用法](./apollo/)。

[更多信息](https://github.com/Akryum/vue-cli-plugin-apollo)

## 手动安装

### 1. Apollo Client

你可以使用 [Apollo Boost](#apollo-boost) 或 [直接使用 Apollo Client](#apollo-client-full-configuration)（需要更多配置工作）。

#### Apollo Boost

Apollo Boost 是一种零配置开始使用 Apollo Client 的方式。它包含一些实用的默认值，例如我们推荐的 `InMemoryCache` 和 `HttpLink`，它非常适合用于快速启动开发。

将它与 `vue-apollo` 和 `graphql` 一起安装：

```
npm install --save vue-apollo graphql apollo-boost
```

或：

```
yarn add vue-apollo graphql apollo-boost
```

在你的应用中创建一个 `ApolloClient` 实例：

```js
import ApolloClient from 'apollo-boost'

const apolloClient = new ApolloClient({
  // 你需要在这里使用绝对路径
  uri: 'https://api.graphcms.com/simple/v1/awesomeTalksClone'
})
```

#### Apollo 客户端完整配置

如果你想要更细粒度的控制，安装这些包来代替 `apollo-boost`：

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

或：

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

在你的应用中创建一个 `ApolloClient` 实例：

```js
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

// 与 API 的 HTTP 连接
const httpLink = new HttpLink({
  // 你需要在这里使用绝对路径
  uri: 'http://localhost:3020/graphql',
})

// 缓存实现
const cache = new InMemoryCache()

// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})
```

### 2. 安装插件到 Vue

```js
import Vue from 'vue'
import VueApollo from 'vue-apollo'

Vue.use(VueApollo)
```

### 3. Apollo provider

Provider 保存了可以在接下来被所有子组件使用的 Apollo 客户端实例。

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})
```

使用 `apolloProvider` 选项将它添加到你的应用程序：

```js
new Vue({
  el: '#app',
  // 像 vue-router 或 vuex 一样注入 apolloProvider
  apolloProvider,
  render: h => h(App),
})
```

现在你已经完成了在组件中使用 Apollo 的所有准备了！
