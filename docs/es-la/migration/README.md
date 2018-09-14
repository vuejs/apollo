# De vue-apollo 2 y Apollo 1

Los cambios principales están relacionados con la configuracion del cliente apollo. El código de sus componentes no deberia verse afectado. Apollo ahora usa un sistema [apollo-link](https://github.com/apollographql/apollo-link) mucho más flexible que permite la composición de links multiples para añadir mayores funcionalidades (como batching, soporte offline y más).

## Instalación

### Paquetes

Antes:

```
npm install --save vue-apollo apollo-client
```

Ahora:

```
npm install --save vue-apollo@next graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

### Imports

Antes:

```js
import Vue from 'vue'
import { ApolloClient, createBatchingNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'
```

Ahora:

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
```

### Configuración de Apollo

Antes:

```js
// Crear la interfaz de red
const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
  transportBatching: true,
})

// Crear suscripción al cliente de websocket 
const wsClient = new SubscriptionClient('ws://localhost:3000/subscriptions', {
  reconnect: true,
})

// Extender la interfaz de red con el cliente de dicha suscripción
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

// Crea el cliente Apollo con la nueva interfaz de red
const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true,
})
```

Ahora:

```js
const httpLink = new HttpLink({
  // Debe usar URLs absolutos aquí 
  uri: 'http://localhost:3020/graphql',
})

// Creatr el link de la subscripción websocket
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// usando la capacidad de hacer "split" con links, puede enviar data a cada link
// dependiendo en el tipo de operación que se envíe
const link = split(
  // split basado en el tipo de operación
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' &&
      operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Crear el cliente apollo
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})
```

### Configuración de Plugin

Antes:

```js
// Crear el cliente apollo
const apolloClient = new ApolloClient({
  networkInterface: createBatchingNetworkInterface({
    uri: 'http://localhost:3020/graphql',
  }),
  connectToDevTools: true,
})

// Instalar el plugin Vue
Vue.use(VueApollo, {
  apolloClient,
})

new Vue({
  // ...
})
```

Ahora:

```js
const httpLink = new HttpLink({
  // Debe usar URLs absolutos aquí
  uri: 'http://localhost:3020/graphql',
})

// Crear el cliente apollo
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Instalar el plugin de vue 
Vue.use(VueApollo)

// Crear "provider"
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

// Usar "provider"
new Vue({
  provide: apolloProvider.provide(),
  // ...
})
```

## Mutations

Los "reducers" de las consultas, han sido removidos. Use la API `update` para actualizar la cache.

## Subscriptions

### Paquetes

Antes:

```
npm install --save subscriptions-transport-ws
```

Ahora:

```
npm install --save apollo-link-ws apollo-utilities
```

### Imports

Antes:

```js
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
```

Ahora:

```js
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
```

Más información en la [documentación oficial de apollo](https://www.apollographql.com/docs/react/2.0-migration.html).