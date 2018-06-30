# 多客户端

如果你的应用需要连接到不同的 GraphQL 入口端点，你可以指定多个 apollo 客户端：

```js
const apolloProvider = new VueApollo({
  clients: {
    a: apolloClient,
    b: otherApolloClient,
  },
  defaultClient: apolloClient,
})
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
tags: {
  query: gql`...`,
  client: 'b',
}
```