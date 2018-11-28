# ApolloQuery 组件

## Props

- `query`：GraphQL 查询（由 `graphql-tag` 转换）
- `variables`：GraphQL 变量对象
- `fetchPolicy`：详见 [apollo fetchPolicy](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy)
- `pollInterval`：详见 [apollo pollInterval](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-pollInterval)
- `notifyOnNetworkStatusChange`：详见 [apollo notifyOnNetworkStatusChange](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-notifyOnNetworkStatusChange)
- `context`：详见 [apollo context](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context)
- `skip`：布尔值，禁用查询获取
- `clientId`：用于解析使用的 Apollo 客户端（在 ApolloProvider 中定义）
- `deep`：布尔值，使用深度 Vue 侦听器
- `tag`：字符串，HTML 标签名（默认值：`div`）；如果是 `undefined`，该组件将成为无渲染组件（内容不会被包装在标签中）
- `debounce`：对重新获取查询结果的防抖毫秒数（例如当变量更改时）
- `throttle`：对重新获取查询结果的节流毫秒数（例如当变量更改时）

## 作用域插槽

- `result`：Apollo 查询结果
  - `result.data`：查询返回的数据
  - `result.loading`：布尔值，表明请求正在进行中
  - `result.error`：当前结果的最终错误
  - `result.networkStatus`：详见 [apollo networkStatus](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-networkStatus)
- `query`：与组件关联的智能查询
- `isLoading`：智能查询加载状态
- `gqlError`：第一个 GraphQL 错误（如果有）
- `times`：结果被更新的次数

## 事件

- `result(resultObject)`
- `error(errorObject)`
