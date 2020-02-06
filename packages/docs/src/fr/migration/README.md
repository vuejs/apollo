# De vue-apollo 2 à Apollo 1

Les principaux changements concernent la mise en place du client Apollo. Le code à l'intérieur de vos composants ne devraient pas être affectés. Apollo utilise désormais [apollo-link](https://github.com/apollographql/apollo-link), un système plus flexible qui permet de composer plusieurs liens et permettre plus de choses (traitement par lots, support hors-connexion, et plus encore).

## Installation

### Packages

Avant :

```
npm install --save vue-apollo apollo-client
```

Après :

```
npm install --save vue-apollo@next graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### Imports

Avant :

```js
import Vue from 'vue'
import { ApolloClient, createBatchingNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'
```

Après :

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
```

### Apollo Setup

Avant :

```js
// Création de l'interface réseau
const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
  transportBatching: true,
})

// Création de la souscription au client websocket
const wsClient = new SubscriptionClient('ws://localhost:3000/subscriptions', {
  reconnect: true,
})

// Extension de l'interface réseau avec la souscription au client
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

// Création du client Apollo avc la nouvell interface réseau
const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true,
})
```

Après :

```js
const httpLink = new HttpLink({
  // Vous devez utiliser un URL absolu
  uri: 'http://localhost:3020/graphql',
})

// Création du lien websocket
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// En utilisant la possibilité de scinder les liens, vous pouvez envoyer
// des données à chaque lien en fonction du type d'opération envoyé
const link = split(
  // Scission basée sur le type d'opération
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' &&
      operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Création du client Apollo
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})
```

### Plugin Setup

Avant :

```js
// Création du client Apollo
const apolloClient = new ApolloClient({
  networkInterface: createBatchingNetworkInterface({
    uri: 'http://localhost:3020/graphql',
  }),
  connectToDevTools: true,
})

// Intallation du plugin Vue
Vue.use(VueApollo, {
  apolloClient,
})

new Vue({
  // ...
})
```

Après :

```js
const httpLink = new HttpLink({
  // Vous devez utiliser un URL absolu
  uri: 'http://localhost:3020/graphql',
})

// Création du client Apollo
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Intallation du plugin Vue
Vue.use(VueApollo)

// Création d'un provider
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// Utilisation du provider
new Vue({
  apolloProvider,
  // ...
})
```

## Mutations

Les query reducers ont été retirés. Utilisez l'API `update` pour mettre le cache à jour.

## Souscriptions

### Packages

Avant :

```
npm install --save subscriptions-transport-ws
```

Après :

```
npm install --save apollo-link-ws apollo-utilities
```

### Imports

Avant :

```js
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

Après :

```js
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
```

Pour plus d'informations, visitez la [documentation Apollo officielle]https://www.apollographql.com/docs/react/v2.5/recipes/2.0-migration].