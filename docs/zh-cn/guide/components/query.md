# ApolloQuery

You can use the `ApolloQuery` (or `apollo-query`) component to make watched Apollo queries directly in your template.

Here is an example:

```vue
<ApolloQuery
  :query="require('../graphql/HelloWorld.gql')"
  :variables="{ name }"
>
  <template slot-scope="{ result: { loading, error, data } }">
    <!-- Loading -->
    <div v-if="loading" class="loading apollo">Loading...</div>

    <!-- Error -->
    <div v-else-if="error" class="error apollo">An error occured</div>

    <!-- Result -->
    <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

    <!-- No result -->
    <div v-else class="no-result apollo">No result :(</div>
  </template>
</ApolloQuery>
```

See [API Reference](../../api/apollo-query.md).
