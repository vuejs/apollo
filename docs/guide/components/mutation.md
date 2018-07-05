# ApolloMutation

You can use the `ApolloMutation` (or `apollo-mutation`) component to call Apollo mutations directly in your template.

Here is an example:

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

See [API Reference](../../api/apollo-mutation.md).
