# Components

## Query components

::: warning WIP
You can use the `ApolloQuery` (or `apollo-query`) component to make watched Apollo queries directly in your template:
:::

```html
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

Props:

- `query`: GraphQL query (transformed by `graphql-tag`)
- `variables`: Object of GraphQL variables
- `fetchPolicy`: See [apollo fetchPolicy](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy)
- `pollInterval`: See [apollo pollInterval](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-pollInterval)
- `notifyOnNetworkStatusChange`: See [apollo notifyOnNetworkStatusChange](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-notifyOnNetworkStatusChange)
- `context`: See [apollo context](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context)
- `skip`: Boolean disabling query fetching
- `clientId`: Used to resolve the Apollo Client used (defined in ApolloProvider)
- `deep`: Boolean to use deep Vue watchers
- `tag`: String HTML tag name (default: `div`)

Scoped slot props:

- `result`: Apollo Query result
  - `result.data`: Data returned by the query
  - `result.loading`: Boolean indicating that a request is in flight
  - `result.error`: Eventual error for the current result
  - `result.networkStatus`: See [apollo networkStatus](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-networkStatus)
  - `result.times`: number of times the result was updated
- `query`: Smart Query associated with the component
- `isLoading`: Smart Query loading state
- `gqlError`: first GraphQL error if any

Events:

- `result(resultObject)`
- `error(errorObject)`

::: warning WIP
You can subscribe to more data with the `ApolloSubscribeToMore` (or `apollo-subscribe-to-more`) component:
:::

```html
<template>
  <ApolloQuery :query="...">
    <ApolloSubscribeToMore
      :document="require('../gql/MessageAdded.gql')"
      :variables="{ channel }"
      :updateQuery="onMessageAdded"
    />

    <!-- ... -->
  </ApolloQuery>
</template>

<script>
export default {
  data () {
    return {
      channel: 'general',
    }
  },

  methods: {
    onMessageAdded (previousResult, { subscriptionData }) {
      // The previous result is immutable
      const newResult = {
        messages: [...previousResult.messages],
      }
      // Add the question to the list
      newResult.messages.push(subscriptionData.data.messageAdded)
      return newResult
    },
  },
}
</script>
```

*You can put as many of those as you want inside a `<ApolloQuery>` component.*

## Mutation component

::: warning WIP
You can use the `ApolloMutation` (or `apollo-mutation`) component to call Apollo mutations directly in your template:
:::

```html
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

Props:

- `mutation`: GraphQL query (transformed by `graphql-tag`)
- `variables`: Object of GraphQL variables
- `optimisticResponse`: See [optimistic UI](https://www.apollographql.com/docs/react/features/optimistic-ui.html)
- `update`: See [updating cache after mutation](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-update)
- `refetchQueries`: See [refetching queries after mutation](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-refetchQueries)
- `tag`: String HTML tag name (default: `div`)

Scoped slot props:

- `mutate(options = undefined)`: Function to call the mutation. You can override the mutation options (for example: `mutate({ variables: { foo: 'bar } })`)
- `loading`: Boolean indicating that the request is in flight
- `error`: Eventual error for the last mutation call
- `gqlError`: first GraphQL error if any

Events:

- `done(resultObject)`
- `error(errorObject)`