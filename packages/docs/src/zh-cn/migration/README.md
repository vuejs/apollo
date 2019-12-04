# From vue-apollo 2 and Apollo 1

主要的变动与 apollo 客户端的设置有关。你的组件代码不应该受到影响。Apollo 现在使用更灵活的 [apollo-link](https://github.com/apollographql/apollo-link) 系统，允许将多个连接组合在一起以添加更多功能（如批处理，离线支持等）。

## 安装

### 包

之前：

```
npm install --save vue-apollo apollo-client
```

之后：

```
npm install --save vue-apollo@next graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### 导入

之前：

```js
import Vue from 'vue'
import { ApolloClient, createBatchingNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'
```

之后：

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
```

### Apollo 设置

之前：

```js
// 创建网络接口
const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
  transportBatching: true,
})

// 创建订阅 websocket 客户端
const wsClient = new SubscriptionClient('ws://localhost:3000/subscriptions', {
  reconnect: true,
})

// 使用订阅客户端扩展网络接口
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

// 用新的网络接口创建 apollo 客户端
const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true,
})
```

之后：

```js
const httpLink = new HttpLink({
  // 你需要在这里使用绝对路径
  uri: 'http://localhost:3020/graphql',
})

// 创建订阅 websocket 连接
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// 使用分割连接的功能
// 你可以根据发送的操作类型将数据发送到不同的连接
const link = split(
  // 根据操作类型分割
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' &&
      operation === 'subscription'
  },
  wsLink,
  httpLink
)

// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})
```

### 插件设置

之前：

```js
// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  networkInterface: createBatchingNetworkInterface({
    uri: 'http://localhost:3020/graphql',
  }),
  connectToDevTools: true,
})

// 安装 vue 插件
Vue.use(VueApollo, {
  apolloClient,
})

new Vue({
  // ...
})
```

之后：

```js
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

// 创建一个 provider
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// 使用 provider
new Vue({
  apolloProvider,
  // ...
})
```

## 变更

查询 reducer 已经被移除。现在使用 `update` API 来更新缓存。

## 订阅

### 包

之前：

```
npm install --save subscriptions-transport-ws
```

之后：

```
npm install --save apollo-link-ws apollo-utilities
```

### 导入

之前：

```js
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

之后：

```js
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
```

了解更多请查看 [apollo 官方文档](https://www.apollographql.com/docs/react/v2.5/recipes/2.0-migration)。