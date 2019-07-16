# ApolloQuery component

Example:

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
    <div v-else-if="error" class="error apollo">An error occurred</div>

    <!-- Result -->
    <div v-else-if="data" class="result apollo">{{ data.hello }}</div>

    <!-- No result -->
    <div v-else class="no-result apollo">No result :(</div>
  </template>
</ApolloQuery>
```

::: warning
To enable support of `gql` string tag in Vue templates, see the necessary setup in [the guide](../guide/components/query.md#tag-setup).
:::

## Props

- `query`: GraphQL query (transformed by `graphql-tag`) or a function that receives the `gql` tag as argument and should return the transformed query
- `variables`: Object of GraphQL variables
- `fetchPolicy`: See [apollo fetchPolicy](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy)
- `pollInterval`: See [apollo pollInterval](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-pollInterval)
- `notifyOnNetworkStatusChange`: See [apollo notifyOnNetworkStatusChange](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-notifyOnNetworkStatusChange)
- `context`: See [apollo context](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context)
- `update`: Function to transform the result `data`, useful for picking a specific part of the response. Example: `:update="data => data.user.messages"`
- `skip`: Boolean disabling query fetching
- `clientId`: id of the Apollo Client used by the query (defined in ApolloProvider `clients` option)
- `deep`: Boolean to use deep Vue watchers
- `tag`: String HTML tag name (default: `div`); if falsy (for example `null` or `undefined`), the component will be renderless (the content won't be wrapped in a tag), in this case, only the first child will be rendered
- `debounce`: Number of milliseconds for debouncing refetches (for example when the variables are changed)
- `throttle`: Number of milliseconds for throttling refetches (for example when the variables are changed)
- `prefetch`: If `false`, will skip prefetching during SSR
- `options`: Other Apollo Watch Query options.

## Scoped slot

- `result`: Apollo Query result
  - `result.data`: Data returned by the query (can be transformed by the `update` prop)
  - `result.fullData`: Raw data returned by the query (not transformed by the `update` prop)
  - `result.loading`: Boolean indicating that a request is in flight (you may need to set `notifyOnNetworkStatusChange` prop for it to change)
  - `result.error`: Eventual error for the current result
  - `result.networkStatus`: See [apollo networkStatus](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-networkStatus)
- `query`: Smart Query associated with the component. It's useful to do some operations like `query.refetch()` or `query.fetchMore()`.
- `isLoading`: Smart Query loading state
- `gqlError`: first GraphQL error if any
- `times`: number of times the result was updated

## Events

- `result(resultObject)`
- `error(errorObject)`
- `loading(boolean)`
