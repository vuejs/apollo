# Smart Query

Cada consulta declarada en la definición `apollo` (es decir, que no comienza con un carácter` $ `) en un componente da como resultado la creación de un objeto Smart Query.

## Opcions

- `query`: documento GraphQL (Puede ser un archivo o un string `gql` ).
- `variables`: Objeto o función reactiva que devuelve un objeto. Cada clave se asignará con un `'$'` en el documento GraphQL, por ejemplo `foo` se convertirá en` $ foo`.
- `throttle`: actualizaciones de las variables del acelerador (en ms).
- `debounce`: actualizaciones de las variables de rebote (en ms).
- `update (data) {return ...}` para personalizar el valor que se establece en la propiedad vue, por ejemplo, si los nombres de los campos no coinciden.
- `result(ApolloQueryResult)` Es un hook invocado cuando se recibe un resultado (consulte la documentación de [ApolloQueryResult](https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/types.ts)).
- `error(error)`  hook invocado cuando hay errores. `error` es un objeto de error de Apollo con una propiedad `graphQLErrors` o `networkError`.
- `loadingKey` actualizará la propiedad de datos del componente que pase como valor. Debe inicializar esta propiedad a `0` en el hook de `data()` del componente. Cuando se carga la consulta, esta propiedad se incrementará en 1; cuando ya no se carga, se reducirá en 1. De esta forma, la propiedad puede representar un contador de las consultas que se están cargando actualmente.
- `watchLoading(isLoading, countModifier)` es un enlace llamado cuando cambia el estado de carga de la consulta. El parámetro `countModifier` es igual a` 1` cuando la consulta se está cargando, o `-1` cuando la consulta ya no se está cargando.
- `manual` es un booleano para deshabilitar la actualización automática de propiedades. Si lo usa, entonces necesita especificar una devolución de llamada `result` (vea el ejemplo a continuación).
- `deep` es un booleano para usar `deep:true` en los watchers de Vue.
- `subscribeToMore`: un objeto o un array de objetos que son [opciones de subscribeToMore](../guide/apollo/subscriptions.md#subscribetomore).
- `prefetch` es una booleano o una función para determinar si la consulta debe ser captada previamente. Ver [Server-Side Rendering](../guide/ssr.md).

Ejemplo:

```js
// Opciones específicas de Apollo
apollo: {
  // Consulta avanzada con parámetros
  // El metodo 'variables' es observado por vue
  pingMessage: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Parametros reactivos
    variables() {
      // Use propiedades reactivas de vue aqui
      return {
          message: this.pingInput,
      }
    },
    // Variables: deep object watch
    deep: false,
    // Utilizamos una devolución de llamada de actualización personalizada porque
    // los nombres de campo no coinciden
    // Por defecto, el atributo 'pingMessage'
    // se usaría en el objeto de resultado 'data'
    // Aquí sabemos que el resultado está en el atributo 'ping'
    // considerando la forma en que funciona el servidor Apollo
    update(data) {
      console.log(data)
      // El valor devuelto actualizará
      // la propiedad vue 'pingMessage'
      return data.ping
    },
    // hook de resultados opcional
    result({ data, loading, networkStatus }) {
      console.log("We got some result!")
    },
    // Error handling
    error(error) {
      console.error('We\'ve got an error!', error)
    },
    // Loading state
    // loadingKey es el nombre de la data property
    // que se incrementará cuando la consulta este cargando
    // y decrementado cuando ya no lo este
    loadingKey: 'loadingQueriesCount',
    // watchLoading sera llamado cada vez que el loading state cambie
    watchLoading(isLoading, countModifier) {
      // isLoading es booleano
      // countModifier es 1 o -1
    },
  },
},
```

Si usted usa `ES2015`, tambien puede escribir `update` de esta manera:

```js
update: data => data.ping
```

Ejemplo de modo manual:

```js
{
  query: gql`...`,
  manual: true,
  result ({ data, loading }) {
    if (!loading) {
      this.items = data.items
    }
  },
}
```

## Propiedades

### Skip

Usted puede pausar o reanudar(unpause) con `skip`:

```js
this.$apollo.queries.users.skip = true
```

### loading

Si la consulta se está cargando:

```js
this.$apollo.queries.users.loading
```

## Métodos

### refresh

Detiene y reinicia la consulta:

```js
this.$apollo.queries.users.refresh()
```

### start

Inicia la consulta:

```js
this.$apollo.queries.users.start()
```

### stop

Detiene la consulta:

```js
this.$apollo.queries.users.stop()
```

### fetchMore

Carga más datos para la paginación:

```js
this.page++

this.$apollo.queries.tagsPage.fetchMore({
  // Variables nuevas
  variables: {
    page: this.page,
    pageSize,
  },
  // Transforma el resultado anterior con data nueva
  updateQuery: (previousResult, { fetchMoreResult }) => {
    const newTags = fetchMoreResult.tagsPage.tags
    const hasMore = fetchMoreResult.tagsPage.hasMore

    this.showMoreEnabled = hasMore

    return {
      tagsPage: {
        __typename: previousResult.tagsPage.__typename,
        // Mergea la lista de etiquetas
        tags: [...previousResult.tagsPage.tags, ...newTags],
        hasMore,
      },
    }
  },
})
```

### subscribeToMore

Subscribirse a más data usando subscripciones GraphQL:

```js
// Necesitamos cancelar la suscripción antes de volver a suscribirse
if (this.tagsSub) {
  this.tagsSub.unsubscribe()
}
// Subscribirse en la consulta
this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
  document: TAG_ADDED,
  variables: {
    type,
  },
  // Muta el resultado anterior
  updateQuery: (previousResult, { subscriptionData }) => {
    // Si agregamos la etiqueta no hacer nada
    // Esto puede ser causado por `updateQuery` De nuestra addTag mutation
    if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
      return previousResult
    }

    return {
      tags: [
        ...previousResult.tags,
        // Agrega la etiqueta nueva
        subscriptionData.data.tagAdded,
      ],
    }
  },
})
```

### refetch

Obtenga la consulta de nuevo, opcionalmente con nuevas variables:

```js
this.$apollo.queries.users.refetch()
// Con variables nuevas
this.$apollo.queries.users.refetch({
  friendsOf: 'id-user'
})
```

### setVariables

Actualice las variables en la consulta y búsquela si han cambiado. Para forzar un reauste, usar `refetch`.

```js
this.$apollo.queries.users.setVariables({
  friendsOf: 'id-user'
})
```

### setOptions

Actualice las opciones de [watchQuery](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery) y refetch:

```js
this.$apollo.queries.users.setOptions({
  fetchPolicy: 'cache-and-network'
})
```

### startPolling

Inicie una actualización automática mediante sondeo (lo que significa volver a analizar cada `x` ms):
```js
this.$apollo.queries.users.startPolling(2000) // ms
```

### stopPolling

Detener el polling:

```js
this.$apollo.queries.users.stopPolling()
```
