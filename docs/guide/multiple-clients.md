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

const optionsClientA = {
    // You can use `https` for secure connection (recommended in production)
    httpEndpoint: 'http://localhost:4000/graphql',
}

const optionsClientB = {
  httpEndpoint: 'http://example.org/graphql',
}

// Call this in the Vue app file
export function createProvider (options = {}) {
  const createClientA= createApolloClient({
    ...defaultOptions,
    ...optionsClientA,
  });

  const createClientB = createApolloClient({
    ...defaultOptions,
    ...optionsClientB,
  });

  const clientA = createClientA.apolloClient;
  const clientB = createClientB.apolloClient;

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    clients: {
      clientA,
      clientB
    },
    defaultClient: clientA,
  });
}
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
