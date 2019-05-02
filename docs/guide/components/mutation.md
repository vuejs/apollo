# ApolloMutation

You can use the `ApolloMutation` (or `apollo-mutation`) component to call Apollo mutations directly in your template.

Here is an example:

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

See [ApolloQuery](./query.md) to learn how to write GraphQL queries in the template.

See [API Reference](../../api/apollo-mutation.md) for all the available options.
