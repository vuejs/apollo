# ApolloMutation

Puede usar el componente `ApolloMutation` (o `apollo-mutation`) para llamar Apollo mutations directamente en su plantilla.

He aquí un ejemplo:

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

Ver [API Reference](../../api/apollo-mutation.md).
