# ApolloMutation component

## Props

- `mutation`: GraphQL query (transformed by `graphql-tag`)
- `variables`: Object of GraphQL variables
- `optimisticResponse`: See [optimistic UI](https://www.apollographql.com/docs/react/features/optimistic-ui.html)
- `update`: See [updating cache after mutation](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-update)
- `refetchQueries`: See [refetching queries after mutation](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-refetchQueries)
- `tag`: String HTML tag name (default: `div`)
- `clientId`: Used to resolve the Apollo Client used (defined in ApolloProvider)

## Scoped slot props

- `mutate(options = undefined)`: Function to call the mutation. You can override the mutation options (for example: `mutate({ variables: { foo: 'bar } })`)
- `loading`: Boolean indicating that the request is in flight
- `error`: Eventual error for the last mutation call
- `gqlError`: first GraphQL error if any

## Events

- `done(resultObject)`
- `error(errorObject)`
