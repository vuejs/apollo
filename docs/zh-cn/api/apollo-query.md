# ApolloQuery 组件

示例：

```vue
<ApolloQuery
  :query="gql => gql`
    query MyHelloQuery ($name: String!) {
      hello (name: $name)
    }
  `"
  :variables="{ name }"
>
  <template v-slot="{ result: { error, data }, isLoading }">
    <!-- Loading -->
    <div v-if="isLoading" class="loading apollo">Loading...</div>

    <!-- Error -->
    <div v-else-if="error" class="error apollo">An error occured</div>

    <!-- Result -->
    <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

    <!-- No result -->
    <div v-else class="no-result apollo">No result :(</div>
  </template>
</ApolloQuery>
```

::: warning
要在 Vue 模板中启用对 `gql` 字符串标签的支持，请在 [指南](../guide/components/query.md#tag-setup) 中查看必要的设置。
:::

## Props

- `query`：GraphQL 查询（由 `graphql-tag` 转换）或一个接收 `gql` 标签作为参数并返回转换后的查询的函数
- `variables`：GraphQL 变量对象
- `fetchPolicy`：详见 [apollo fetchPolicy](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy)
- `pollInterval`：详见 [apollo pollInterval](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-pollInterval)
- `notifyOnNetworkStatusChange`：详见 [apollo notifyOnNetworkStatusChange](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-notifyOnNetworkStatusChange)
- `context`：详见 [apollo context](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context)
- `update`：用于转换结果 `data` 的函数，用于在响应中选择特定部分。示例：`:update="data => data.user.messages"`
- `skip`：布尔值，禁用查询获取
- `clientId`：查询所使用的 Apollo 客户端 id（在 ApolloProvider 的 `clients` 选项中定义）
- `deep`：布尔值，使用深度 Vue 侦听器
- `tag`：字符串，HTML 标签名（默认值：`div`）；如果是假值（如 `null` 或 `undefined`），该组件将成为无渲染组件（内容不会被包装在标签中），在这种情况下，只有第一个子元素会被渲染
- `debounce`：对重新获取查询结果的防抖毫秒数（例如当变量更改时）
- `throttle`：对重新获取查询结果的节流毫秒数（例如当变量更改时）
- `prefetch`：如为 `false`，将跳过 SSR 期间的预取

## 作用域插槽

- `result`：Apollo 查询结果
  - `result.data`：查询返回的数据（可使用 `update` 属性转换）
  - `result.fullData`：查询返回的原始数据（未使用 `update` 属性转换）
  - `result.loading`：布尔值，表明请求正在进行中（你可能需要设置 `notifyOnNetworkStatusChange` 属性来修改它）
  - `result.error`：当前结果的最终错误
  - `result.networkStatus`：详见 [apollo networkStatus](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-networkStatus)
- `query`：与组件关联的智能查询，用于执行 `query.refetch()` 或 `query.fetchMore()` 之类的操作
- `isLoading`：智能查询加载状态
- `gqlError`：第一个 GraphQL 错误（如果有）
- `times`：结果被更新的次数

## 事件

- `result(resultObject)`
- `error(errorObject)`
- `loading(boolean)`
