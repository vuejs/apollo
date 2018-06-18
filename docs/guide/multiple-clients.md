# Multiple clients

You can specify multiple apollo clients if your app needs to connect to different GraphQL endpoints:

```javascript
const apolloProvider = new VueApollo({
  clients: {
    a: apolloClient,
    b: otherApolloClient,
  },
  defaultClient: apolloClient,
})
```

In the component `apollo` option, you can define the client for all the queries, subscriptions and mutations with `$client` (only for this component):

```javascript
export default {
  apollo: {
    $client: 'b',
  },
}
```

You can also specify the client in individual queries, subscriptions and mutations with the `client` property in the options:

```javascript
tags: {
  query: gql`...`,
  client: 'b',
}
```