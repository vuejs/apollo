# ApolloQuery component

## Props

- `query`: GraphQL query (transformed by `graphql-tag`)
- `variables`: Object of GraphQL variables
- `fetchPolicy`: See [apollo fetchPolicy](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-fetchPolicy)
- `pollInterval`: See [apollo pollInterval](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-pollInterval)
- `notifyOnNetworkStatusChange`: See [apollo notifyOnNetworkStatusChange](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-notifyOnNetworkStatusChange)
- `context`: See [apollo context](https://www.apollographql.com/docs/react/basics/queries.html#graphql-config-options-context)
- `skip`: Boolean disabling query fetching
- `clientId`: Used to resolve the Apollo Client used (defined in ApolloProvider)
- `deep`: Boolean to use deep Vue watchers
- `tag`: String HTML tag name (default: `div`); if `undefined`, the component will be renderless (the content won't be wrapped in a tag)
- `debounce`: Number of milliseconds for debouncing refetches (for example when the variables are changed)
- `throttle`: Number of milliseconds for throttling refetches (for example when the variables are changed)

## Scoped slot

- `result`: Apollo Query result
  - `result.data`: Data returned by the query
  - `result.loading`: Boolean indicating that a request is in flight
  - `result.error`: Eventual error for the current result
  - `result.networkStatus`: See [apollo networkStatus](https://www.apollographql.com/docs/react/basics/queries.html#graphql-query-data-networkStatus)
- `query`: Smart Query associated with the component
- `isLoading`: Smart Query loading state
- `gqlError`: first GraphQL error if any
- `times`: number of times the result was updated

## Events

- `result(resultObject)`
- `error(errorObject)`
