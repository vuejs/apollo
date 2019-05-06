# ApolloMutation

你可以使用 `ApolloMutation`（或 `apollo-mutation`）组件直接在模板中调用 Apollo 变更。

这是一个简单的例子：

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

在 [ApolloQuery](./query.md) 查看如何在模板中编写 GraphQL 查询。

在 [API 参考](../../api/apollo-mutation.md) 查看所有可用的选项。
