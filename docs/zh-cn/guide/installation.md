# 安装

:::tip
如果你正在使用 vue-cli 3.x，你可以 [使用这个 vue-cli 插件](https://github.com/Akryum/vue-cli-plugin-apollo)：它会在几分钟内安装你需要的所有内容，这样你可以立刻开始写代码！
:::

尝试在服务器端配置之前安装这些包，并且将 apollo 添加到 meteor.js 中。

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

或：

```
yarn add vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

## Apollo 客户端

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

// 安装 vue 插件
Vue.use(VueApollo)
```

## Apollo provider

Provider 保存了可以在接下来被所有子组件使用的 apollo 客户端实例。通过 `provide` 属性将它注入你的组件：

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App),
})
```