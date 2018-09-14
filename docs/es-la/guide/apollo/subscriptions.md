# Subscriptions

## Configuración

*Para la implementación del servidor, puede echar un vistazo a [este sencillo ejemplo](https://github.com/Akryum/apollo-server-example).*

Para habilitar la subscripcion por websocket, se requiere una configuración adicional:

```
npm install --save apollo-link-ws apollo-utilities
```

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
// Imports nuevos
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import VueApollo from 'vue-apollo'

const httpLink = new HttpLink({
  // Usar URL absoluto
  uri: 'http://localhost:3020/graphql',
})

// Crear link de subscripción websocket
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// Puede enviar data a cada link 
// dependiendo el tipo de operación
const link = split(
  // split por tipo de operación
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' &&
      operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Crear apollo client
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Instalar vue plugin 
Vue.use(VueApollo)
```

## Subscribe To More

Si necesita actualizar el resultado de una consulta de una suscripción, la mejor manera es usar el método `subscribeToMore`. Esto creará [Smart Subscriptions](../../api/smart-subscription.md) que serán linkeadas a la consulta. Solo añada `subscribeToMore` a su consulta:

```js
apollo: {
  tags: {
    query: TAGS_QUERY,
    subscribeToMore: {
      document: gql`subscription name($param: String!) {
        itemAdded(param: $param) {
          id
          label
        }
      }`,
      // Variables pasadas a la suscripción. Como estamos usando una función,
      // son reactivas
      variables () {
        return {
          param: this.param,
        }
      },
      // Mutando el resultado anterior
      updateQuery: (previousResult, { subscriptionData }) => {
        // Aquí, devuelve el nuevo resultado del anterior con los nuevos datos
      },
    }
  }
}
```

::: tip
Puede pasar un array de subscripciones a `subscribeToMore` para suscribirse a subscripciones multiples en esta consulta.
:::

### Uso Alternativo

Puede acceder a las consultas que definió en la opción `apollo` con `this.$ Apollo.queries.<Name>`, por lo que se vería así:

```js
this.$apollo.queries.tags.subscribeToMore({
  // GraphQL document
  document: gql`subscription name($param: String!) {
    itemAdded(param: $param) {
      id
      label
    }
  }`,
  // Variables pasadas a la subscripción
  variables: {
    param: '42',
  },
  // Mutando el resultado anterior
  updateQuery: (previousResult, { subscriptionData }) => {
    // Devuelte el resultado desde el anterior con la nueva data
  },
})
```

Si la consulta relacionada se detiene, la suscripción se destruirá automáticamente.

Aquí hay un ejemplo:

```js
// Subscription GraphQL document
const TAG_ADDED = gql`subscription tags($type: String!) {
  tagAdded(type: $type) {
    id
    label
    type
  }
}`

// Etiquetas SubscribeToMore 
// Tenemos distintos tipos de etiquetas, 
// con un 'canal' de subscripción 'channel' por cada tipo
this.$watch(() => this.type, (type, oldType) => {
  if (type !== oldType || !this.tagsSub) {
    // unsubscribe antes de re-subscribing
    if (this.tagsSub) {
      this.tagsSub.unsubscribe()
    }
    // Susbscribirse en la consulta
    this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
      document: TAG_ADDED,
      variables: {
        type,
      },
      // Mutar el resultado anterior
      updateQuery: (previousResult, { subscriptionData }) => {
        // Si ya se agregó la etiqueta, no hacer nada
        // Esto lo causa el `updateQuery` de nuestra mutation addTag 
        if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
          return previousResult
        }

        return {
          tags: [
            ...previousResult.tags,
            // Agregar la nueva etiqueta
            subscriptionData.data.tagAdded,
          ],
        }
      },
    })
  }
}, {
  immediate: true,
})
```

## Simple subscription

::: danger
Si desea actualizar una consulta con el resultado de la suscripción, use `subscribeToMore`.
Los métodos a continuación son adecuados para un caso de uso de 'notify'
:::

You can declare [Smart Subscriptions](../../api/smart-subscription.md) in the `apollo` option with the `$subscribe` keyword:

```js
apollo: {
  // Subscripciones
  $subscribe: {
    // Cuando se agrega una etiqueta
    tagAdded: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Variables reactivas
      variables() {
        // Funciona como consultas regulares
        // y hará re-subscribe con las variables correctas
        // cada vez que cambien los valores
        return {
          type: this.type,
        }
      },
      // Result hook
      result(data) {
        console.log(data)
      },
    },
  },
},
```

Puede ahora accede con `this.$apollo.subscriptions.<name>`.

:::tip
Al igual que para las consultas, puede declarar la suscripción [con una función](./ queries.md # option-function), y puede declarar la opción `query` [con una función reactiva](./ queries.md # reactive -query-definition).
:::

## Skipping 

Al hacer skipping, se deshabilita la subscripción y no volverá a ser actualizada. Puede usar la opción `skip` :

```js
// Opciones especificas de apollo
apollo: {
  // Subscripciones
  $subscribe: {
    // Cuando se agrega la etiqueta
    tags: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Variables reactivas
      variables() {
        return {
          type: this.type,
        }
      },
      // Result hook
      result(data) {
        // Actualizamos la data local
        this.tags.push(data.tagAdded)
      },
      // Skip 
      skip() {
        return this.skipSubscription
      }
    },
  },
},
```

Aquí, `skip` se llamará automáticamente cuando cambie la propiedad del componente `skipSubscription`.

También puede acceder a la suscripción directamente y configurar la propiedad `skip`:

```js
this.$apollo.subscriptions.tags.skip = true
```

## Agregar una Smart Subscription manualmente

Puede agregar manualmente una Smart Subscription con el método `$apollo.addSmartSubscription(key, options)`:

```js
created () {
  this.$apollo.addSmartSubscription('tagAdded', {
    // Mismas opciones como '$subscribe' arriba
  })
}
```

:::tip
Internamente, se llama a este método para cada entrada del objeto `$subscribe` en la opción `apollo` del componente.
:::

## Standard Apollo subscribe

Utilice el método `$apollo.subscribe()` para suscribirse a una suscripción GraphQL que se eliminará automáticamente cuando se destruya el componente. **NO** se creará una Smart Subscription.

```js
mounted() {
  const subQuery = gql`subscription tags($type: String!) {
    tagAdded(type: $type) {
      id
      label
      type
    }
  }`

  const observer = this.$apollo.subscribe({
    query: subQuery,
    variables: {
      type: 'City',
    },
  })

  observer.subscribe({
    next(data) {
      console.log(data)
    },
    error(error) {
      console.error(error)
    },
  })
},
```
