# ApolloProvider

## Constructor

```javascript
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
    // For example: default loading key
    $loadingKey: 'loading',
  },
  // Watch loading state for all queries
  // See the 'watchLoading' advanced option
  watchLoading (state, mod) {
    loading += mod
    console.log('Global loading', loading, mod)
  },
  // Global error handler for all smart queries and subscriptions
  errorHandler (error) {
    console.log('Global error handler')
    console.error(error)
  },
})
```

Use the apollo provider into your Vue app:

```javascript
new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```

## Methods

### prefetchAll

(SSR) Prefetch all queued component definitions and returns a promise resolved when all corresponding apollo data is ready.

```javascript
await apolloProvider.prefetchAll (context, componentDefs, options)
```

`context` is passed as the argument to the `prefetch` options inside the smart queries. It may contain the route and the store.

`options` defaults to:

```javascript
{
  // Include components outside of the routes
  // that are registered with `willPrefetch`
  includeGlobal: true,
}
```

### getStates

(SSR) Returns the apollo stores states as JavaScript objects.

```JavaScript
const states = apolloProvider.getStates(options)
```

`options` defaults to:

```javascript
{
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

### exportStates

(SSR) Returns the apollo stores states as JavaScript code inside a String. This code can be directly injected to the page HTML inside a `<script>` tag.

```javascript
const js = apolloProvider.exportStates(options)
```

`options` defaults to:

```javascript
{
  // Global variable name
  globalName: '__APOLLO_STATE__',
  // Global object on which the variable is set
  attachTo: 'window',
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```
