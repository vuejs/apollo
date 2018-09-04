# 安装

## Vue CLI Plugin

我为 [vue-cli](http://cli.vuejs.org) 制作了一个插件，因此仅用两分钟你就可以添加 Apollo（附带一个可选的 GraphQL 服务器）！✨🚀

在你的 vue-cli 3 项目中：

```bash
vue add apollo
```

然后你可以跳到下一部分：[基本用法](./apollo/)。

[更多信息](https://github.com/Akryum/vue-cli-plugin-apollo)

## Apollo Boost

Apollo Boost 是一种零配置开始使用 Apollo Client 的方式。它包含一些实用的默认值，例如我们推荐的 `InMemoryCache` 和 `HttpLink`，它非常适合用于快速启动开发：

安装：

```
npm install --save vue-apollo graphql apollo-boost
```

或：

```
yarn add vue-apollo graphql apollo-boost
```

### Apollo client

在你的应用中创建一个 `ApolloClient` 实例并安装 `VueApollo` 插件：

```js
import Vue from 'vue'
import ApolloClient from "apollo-boost"
import VueApollo from "vue-apollo"

const apolloProvider = new VueApollo({
  defaultClient: new ApolloClient({
    uri: "https://api.graphcms.com/simple/v1/awesomeTalksClone"
  })
})

Vue.use(VueApollo)
```



## 手动操作

如果你想要更细的粒度控制，尝试在服务器端配置之前安装这些包，并且将 apollo 添加到 meteor.js 中。

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

或：

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### Apollo 客户端

在你的应用中创建一个 `ApolloClient` 实例并安装 `VueApollo` 插件：

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

const httpLink = new HttpLink({
  // 你需要在这里使用绝对路径
  uri: 'http://localhost:3020/graphql',
})

// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// 安装 vue 插件
Vue.use(VueApollo)
```

## Apollo provider

Provider 保存了可以在接下来被所有子组件使用的 Apollo 客户端实例。通过 `provide` 属性将它注入你的组件：

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```