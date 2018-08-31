# ApolloMutation

你可以使用 `ApolloMutation`（或 `apollo-mutation`）组件直接在模板中调用 Apollo 变更。

这是一个简单的例子：

```vue
<ApolloMutation
  :mutation="require('@/graphql/userLogin.gql')"
  :variables="{
    email,
    password,
  }"
  @done="onDone"
>
  <template slot-scope="{ mutate, loading, error }">
    <button :disabled="loading" @click="mutate()">Click me</button>
    <p v-if="error">An error occured: {{ error }}</p>
  </template>
</ApolloMutation>
```

更多参见 [API 参考](../../api/apollo-mutation.md).
