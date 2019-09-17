# ApolloProvider

## Constructor

```js
const apolloProvider = new VueApollo({
  // Multiple clients support
  // Use the 'client' option inside queries
  // or '$client' on the apollo definition
  clients: {
    a: apolloClientA,
    b: apolloClientB,
  },
  // Default client
  defaultClient: apolloClient,
  // Default 'apollo' definition
  defaultOptions: {
    // See 'apollo' definition
    // For example: default query options
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
  // Watch loading state for all queries
  // See 'Smart Query > options > watchLoading' for detail
  watchLoading (isLoading, countModifier) {
    loading += countModifier
    console.log('Global loading', loading, countModifier)
  },
  // Global error handler for all smart queries and subscriptions
  errorHandler (error) {
    console.log('Global error handler')
    console.error(error)
  },
  /*
    MUST* return a promise
    Allows us to handle the serverPrefetch as part of ssr in a way we need
    
    // example: short circuit SSR gql request after 1 second
    handleServerPrefetch(apolloPromises) {
      const shirtCircuit = new Promise((resolve, reject) => { setTimeout(resolve, 4000) })
      
      return Promise.race(apolloPromises, shortCircuit)
    }
  */
  handleServerPrefetch: Function: receives apolloPromises must return a Promise
  // Globally turn off prefetch ssr
  prefetch: Boolean
})
```

Use the apollo provider into your Vue app:

```js
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```
