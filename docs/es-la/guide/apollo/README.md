# Apollo en componentes Vue

Para declarar consultas de apollo en su componente Vue, agregue un objeto `apollo` :

```js
new Vue({
    apollo: {
        // Opciones específicas de Apollo
    },
})
```

Puede acceder a las instancias del  [apollo-client](https://www.apollographql.com/docs/react/) con `this.$apollo.provider.defaultClient` o `this.$apollo.provider.clients.<key>` (para [Clientes múltiples](../multiple-clients.md)) en todos sus componentes Vue.

## Consultas (queries)

En el objeto `apollo`, agregar un atributo por cada propiedad a la que se le quiera popular con el resultado de una consulta Apollo.

```js
import gql from 'graphql-tag'

export default {
  apollo: {
    // Consulta simple que actualiza la propiedad vue 'hello'
    hello: gql`query { hello }`,
  },
}
```

Más detalles en la [Sección de Consultas](./queries.md).

## Mutations

Use `this.$apollo.mutate` para enviar mutations:

```js
methods: {
  async addTag() {
    // Llama la mutation
    const result = await this.$apollo.mutate({
      // Query
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Parametros
      variables: {
        label: this.newTag,
      },
    })
  }
}
```

Más detalles en la [Sección de mutations](./mutations.md).

## Opciones especiales

Las opciones especiales comienzan con `$` en el objeto `apollo`.

- `$skip` para deshabilitar todas las consultas y suscripciones (ver a continuación)
- `$skipAllQueries` para deshabilitar todas las consultas (ver a continuación)
- `$skipAllSubscriptions` para deshabilitar todas las suscripciones (ver a continuación)
- `$deep` para ver con `deep: true` en las propiedades anteriores cuando se proporciona una función
- `$error` para detectar errores en un controlador predeterminado (consulte las opciones avanzadas de `error` para consultas inteligentes)
- `$query` para aplicar opciones predeterminadas a todas las consultas en el componente

Ejemplo:

```vue
<script>
export default {
  data () {
    return {
      loading: 0,
    }
  },
  apollo: {
    $query: {
      loadingKey: 'loading',
    },
    query1: { ... },
    query2: { ... },
  },
}
</script>
```

Puede definir en apollo provider una serie de opciones por defecto a aplicar a las definiciones `apollo` . 

Por ejemplo:

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    // opciones de apollo aplicadas a todas las consultas en componentes
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
})
```

## Skip all

Puede desactivar todas las consultas para el componente con `skipAllQueries`, todas las suscripciones con` skipAllSubscriptions` y ambas con `skipAll`:

```js
this.$apollo.skipAllQueries = true
this.$apollo.skipAllSubscriptions = true
this.$apollo.skipAll = true
```

También puede declarar estas propiedades en la opción `apollo` del componente. Pueden ser booleanos:

```js
apollo: {
  $skipAll: true
}
```

O funcciones reactivas:

```js
apollo: {
  $skipAll () {
    return this.foo === 42
  }
}
```