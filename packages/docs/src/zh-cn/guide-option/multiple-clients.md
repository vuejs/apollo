# 多客户端

如果你的应用需要连接到不同的 GraphQL 入口端点，你可以指定多个 apollo 客户端：

```js
const defaultOptions = {
  // 你可以使用 `wss` 进行安全连接（在生产环境中推荐）
  // 使用 `null` 来禁用订阅
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage 令牌
  tokenName: AUTH_TOKEN,
  // 使用 Apollo Engine 启用自动查询持久化
  persisting: false,
  // 在所有情形下都使用 websockets（没有 HTTP）
  // 你需要传递一个 `wsEndpoint` 来让它运作
  websocketsOnly: false,
  // 是否已在服务端被渲染？
  ssr: false,
}

const clientAOptions = {
  // 你可以使用 `https` 进行安全连接（在生产环境中推荐）
  httpEndpoint: 'http://localhost:4000/graphql',
}

const clientBOptions = {
  httpEndpoint: 'http://example.org/graphql',
}

// 在 Vue 应用程序文件中调用此方法
export function createProvider(options = {}) {
  const createA = createApolloClient({
    ...defaultOptions,
    ...clientAOptions,
  })

  const createB = createApolloClient({
    ...defaultOptions,
    ...clientBOptions,
  })

  const a = createA.apolloClient
  const b = createB.apolloClient

  // 创建 vue apollo provider
  const apolloProvider = createApolloProvider({
    clients: {
      a,
      b
    },
    defaultClient: a,
  })
}
```

在组件的 `apollo` 选项中，你可以使用 `$client` 为所有的查询、订阅和变更定义要使用的客户端（仅限在此组件内）：

```js
export default {
  apollo: {
    $client: 'b',
  },
}
```

你也可以在单个查询，订阅和变更的选项中使用 `client` 属性来指定客户端：

```js
export default {
  apollo: {
    tags: {
      query: gql`...`,
      client: 'b',
    }
  }
}
```
