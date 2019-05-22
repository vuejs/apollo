# ApolloMutation 组件

示例：

```vue
<ApolloMutation
  :mutation="gql => gql`
    mutation DoStuff ($name: String!) {
      someWork (name: $name) {
        success
        timeSpent
      }
    }
  `"
  :variables="{
    name
  }"
  @done="onDone"
>
  <template v-slot="{ mutate, loading, error }">
    <button :disabled="loading" @click="mutate()">Click me</button>
    <p v-if="error">An error occured: {{ error }}</p>
  </template>
</ApolloMutation>
```

## Props

- `mutation`：GraphQL 查询（由 `graphql-tag` 转换）或一个接收 `gql` 标签作为参数并返回转换后的查询的函数
- `variables`：GraphQL 变量对象
- `optimisticResponse`：详见 [乐观 UI](https://www.apollographql.com/docs/react/features/optimistic-ui.html)
- `update`：详见 [变更后更新缓存](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-update)
- `refetchQueries`：详见 [变更后重新获取查询](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-refetchQueries)
- `clientId`：查询所使用的 Apollo 客户端 id（在 ApolloProvider 的 `clients` 选项中定义）
- `tag`：字符串，HTML 标签名（默认值：`div`）；如果是 `undefined`，该组件将成为无渲染组件（内容不会被包装在标签中）

## 作用域插槽 props

- `mutate(options = undefined)`：调用变更的函数。你可以重载变更的选项（例如：`mutate({ variables: { foo: 'bar } })`）
- `loading`：布尔值，表明请求正在进行中
- `error`：最后一次变更调用的最终错误
- `gqlError`：第一个 GraphQL 错误（如果有）

## 事件

- `done(resultObject)`
- `error(errorObject)`
- `loading(boolean)`
