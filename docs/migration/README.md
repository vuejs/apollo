# From vue-apollo 2 and Apollo 1

The main changes are related to the apollo client setup. Your components code shouldn't be affected. Apollo now uses a more flexible [apollo-link](https://github.com/apollographql/apollo-link) system that allows compositing multiple links together to add more features (like batching, offline support and more).

## Installation

### Packages

Before:

```
npm install --save vue-apollo apollo-client
```

After:

```
npm install --save vue-apollo@next graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### Imports

Before:

```js
import Vue from 'vue'
import { ApolloClient, createBatchingNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'
```

After:

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
```

### Apollo Setup

Before:

```js
// Create the network interface
const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
  transportBatching: true,
})

// Create the subscription websocket client
const wsClient = new SubscriptionClient('ws://localhost:3000/subscriptions', {
  reconnect: true,
})

// Extend the network interface with the subscription client
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

// Create the apollo client with the new network interface
const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true,
})
```

After:

```js
const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3020/graphql',
})

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' &&
      operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Create the apollo client
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})
```

### Plugin Setup

Before:

```js
// Create the apollo client
const apolloClient = new ApolloClient({
  networkInterface: createBatchingNetworkInterface({
    uri: 'http://localhost:3020/graphql',
  }),
  connectToDevTools: true,
})

// Install the vue plugin
Vue.use(VueApollo, {
  apolloClient,
})

new Vue({
  // ...
})
```

After:

```js
const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3020/graphql',
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Install the vue plugin
Vue.use(VueApollo)

// Create a provider
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// Use the provider
new Vue({
  apolloProvider,
  // ...
})
```

## Mutations

Query reducers have been removed. Use the `update` API to update the cache now.

## Subscriptions

### Packages

Before:

```
npm install --save subscriptions-transport-ws
```

After:

```
npm install --save apollo-link-ws apollo-utilities
```

### Imports

Before:

```js
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

After:

```js
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
```

Learn more at the [official apollo documentation](https://www.apollographql.com/docs/react/2.0-migration.html).