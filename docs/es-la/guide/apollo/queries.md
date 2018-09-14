# Consultas (Queries)

En el objeto `apollo`, agregue un atributo para cada propiedad que desee alimentar con el resultado de una "Apollo query". Cada uno de ellos se convertirá en una consulta inteligente.(Smart Query)

## Consultas Simples

Use `gql` para escribir sus consultas de GraphQL:

```js
import gql from 'graphql-tag'
```

Put the [gql](https://github.com/apollographql/graphql-tag) query directly as the value:

```js
apollo: {
  // Consulta simple para actualizar la propiedad vue 'hello'
  hello: gql`{hello}`,
},
```

Puede acceder a la consulta con `this.$apollo.queries.<name>`.

Puede inicializar la propiedad en el `data` hook de su componente vue:

```js
data () {
  return {
    // Inicialize apollo data
    hello: '',
  },
},
```

Server-side, y los schema y resolver correspondientes:

```js
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    hello(root, args, context) {
      return "Hello world!"
    },
  },
}
```

Para mayor información, visite la [documentación de apollo](https://www.apollographql.com/docs/apollo-server/).

Puede usar su propiedad como siempre en su componente vue:

```vue
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

## Consulta con parámetros

Puede agregar variables (leer parámetros) a su consulta `gql` declarando` query` y `variables` en un objeto:

```js
// Opciones especificas de Apollo
apollo: {
  // Consulta con parametros
  ping: {
    // gql query
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Parametros estaticos
    variables: {
      message: 'Meow',
    },
  },
},
```

Puede usar las opciones de `watchQuery` en el objeto, tales como:
 - `fetchPolicy`
 - `pollInterval`
 - ...

See the [apollo doc](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery) for more details.

Por ejemplo, puede agregar la opcion apollo `fetchPolicy` de esta manera:

```js
apollo: {
  // Consulta con parametros
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    variables: {
      message: 'Meow'
    },
    // Opciones adicionales
    fetchPolicy: 'cache-and-network',
  },
},
```

De nuevo, puede inicializar su propiedad en su componente vue:

```js
data () {
  return {
    // Inicializar apollo data
    ping: '',
  }
},
```

Server-side, agregue su schema y resolver correspondientes:

```js
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    ping(root, { message }, context) {
      return `Answering ${message}`
    },
  },
}
```

Y luego uselo en su componente vue

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ ping }}
    </p>
  </div>
</template>
```

## Loading state

Puede mostrar un mensaje de carga gracias a la prop `$apollo.loading`:

```vue
<div v-if="$apollo.loading">Loading...</div>
```

O específicamente esta consulta `ping`:

```vue
<div v-if="$apollo.queries.ping.loading">Loading...</div>
```

## Opción de Función

Puede usar una función que se invocará una vez que se crea el componente y debe devolver el objeto de opción:

```js
// Opciones específicas de Apollo
apollo: {
  // Consulta con parámetros
  ping () {
    // Esto se llama una vez que se crea el componente
    // Debe devolver el objeto de opción
    return {
      // gql query
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Parámetros estáticos
      variables: {
        message: 'Meow',
      },
    }
  },
},
```

::: tip
Esto también funciona para [subscripciones](./subscriptions.md).
:::

## Definición de consulta reactiva

Puede usar una función para la opción `query`. Esto actualizará la definición de la consulta graphql automáticamente:

```js
// La `featuredTag` puede ser una etiqueta aleatoria o la última etiqueta agregada
featuredTag: {
  query () {
    // Aquí puede acceder a la instancia del componente con 'this'
    if (this.showTag === 'random') {
      return gql`{
        randomTag {
          id
          label
          type
        }
      }`
    } else if (this.showTag === 'last') {
      return gql`{
        lastTag {
          id
          label
          type
        }
      }`
    }
  },
  // Necesitamos esto para asignar el valor de la propiedad del componente 'featuredTag'
  update: data => data.randomTag || data.lastTag,
},
```

::: tip
Esto también funciona para [subscripciones](./subscriptions.md).
:::

## Reactive parameters

Use una función para hacer que los parámetros sean reactivos con las propiedades vue:

```js
// Opciones específicas de Apollo
apollo: {
  // Consulta con parámetros
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Parámetros reactivos
    variables() {
      // Usa las propiedades reactivas vue aquí
      return {
          message: this.pingInput,
      }
    },
  },
},
```

Esto recuperará la consulta cada vez que un parámetro cambie, por ejemplo:

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Enter a message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

## Omitiendo la consulta(Skipping)

Si la consulta se omite, la desactivará y el resultado ya no se actualizará. Puedes usar la opción `skip`:

```js
// Opciones específicas de Apollo
apollo: {
  tags: {
    // GraphQL Query
    query: gql`query tagList ($type: String!) {
      tags(type: $type) {
        id
        label
      }
    }`,
    // Variables reactivas 
    variables() {
      return {
        type: this.type,
      }
    },
    // Inhabilita la consulta
    skip() {
      return this.skipQuery
    },
  },
},
```

HAquí, se llamará automáticamente a 'skip` cuando cambie la propiedad del componente `skipQuery`.

También puede acceder a la consulta directamente y configurar la propiedad `skip`:

```js
this.$apollo.queries.tags.skip = true
```

## Ejemplo de consulta reactiva

Aquí hay un ejemplo de consulta reactiva usando sondeo(polling):

```js
// Opciones específicas de Apollo
apollo: {
  // Propiedad de datos 'tags' en la instancia de vue
  tags: {
    query: gql`query tagList {
      tags {
        id,
        label
      }
    }`,
    pollInterval: 300, // ms
  },
},
```

Así es como se ve del lado del servidor:

```js
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`

// Generador 'fake word'
import casual from 'casual'

// Generando etiquetas
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(casual.word)
}

function addTag(label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags
    },
  },
}
```

## Añadir Smart Query manualmente

Puede agregar manualmente una consulta inteligente con el método `$apollo.addSmartQuery(key,options)`:

```js
created () {
  this.$apollo.addSmartQuery('comments', {
    // Mismas ociones que el anterior
  })
}
```

::: tip
Internamente, se llama a este método para cada entrada de consulta en la opción `apollo` del componente.
:::

## Opciones avanzadas

Hay incluso más opciones específicas para vue-apollo, vea la [Referencia API](../../api/smart-query.md).
