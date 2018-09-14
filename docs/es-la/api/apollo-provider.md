# ApolloProvider

## Constructor

```js
const apolloProvider = new VueApollo({
  // Soporte de múltiples clientes
  // Usa la opción 'cliente' dentro de las consultas
  // o '$client' en la definición de apollo
  clients: {
    a: apolloClientA,
    b: apolloClientB,
  },
  // Cliente por defecto
  defaultClient: apolloClient,
  // Definicion 'apollo' predeterminada
  defaultOptions: {
    // ver definicion 'apollo'
    // ej: default query options
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
  // Ver loading state para todas las consultas
  // ver 'Smart Query > opciones > watchLoading' para mas detalles
  watchLoading (isLoading, countModifier) {
    loading += countModifier
    console.log('Global loading', loading, countModifier)
  },
  // Controlador de error global para todas las smart queries y subscripciones
  errorHandler (error) {
    console.log('Global error handler')
    console.error(error)
  },
})
```

Use apollo provider en su app Vue:

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```
