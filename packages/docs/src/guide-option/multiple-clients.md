# Multiple clients

You can specify multiple apollo clients if your app needs to connect to different GraphQL endpoints:

```js
const defaultOptions = {
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,
}

const clientAOptions = {
    // You can use `https` for secure connection (recommended in production)
    httpEndpoint: 'http://localhost:4000/graphql',
}

const clientBOptions = {
  httpEndpoint: 'http://example.org/graphql',
}

// Call this in the Vue app file
export function createProvider (options = {}) {
  const createA= createApolloClient({
    ...defaultOptions,
    ...clientAOptions,
  });

  const createB = createApolloClient({
    ...defaultOptions,
    ...clientBOptions,
  });

  const a = createA.apolloClient;
  const b = createB.apolloClient;

  // Create vue apollo provider
  const apolloProvider = createApolloProvider({
    clients: {
      a,
      b
    }
    defaultClient: a,
})
```

In the component `apollo` option, you can define the client for all the queries, subscriptions and mutations with `$client` (only for this component):

```js
export default {
  apollo: {
    $client: 'b',
  },
}
```

You can also specify the client in individual queries, subscriptions and mutations with the `client` property in the options:

```js
tags: {
  query: gql`...`,
  client: 'b',
}
```
