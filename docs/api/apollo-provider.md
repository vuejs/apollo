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

## Methods

### provide

Use this to inject the provider into an app:

```js
new Vue({
  el: '#app',
  provide: apolloProvider.provide(),
  render: h => h(App),
})
```

### prefetchAll

(SSR) Prefetch all queued component definitions and returns a promise resolved when all corresponding apollo data is ready.

```js
await apolloProvider.prefetchAll (context, componentDefs, options)
```

`context` is passed as the argument to the `prefetch` options inside the smart queries. It may contain the route and the store.

`options` defaults to:

```js
{
  // Include components outside of the routes
  // that are registered with `willPrefetch`
  includeGlobal: true,
}
```

### getStates

(SSR) Returns the apollo stores states as JavaScript objects.

```js
const states = apolloProvider.getStates(options)
```

`options` defaults to:

```js
{
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

### exportStates

(SSR) Returns the apollo stores states as JavaScript code inside a String. This code can be directly injected to the page HTML inside a `<script>` tag.

```js
const js = apolloProvider.exportStates(options)
```

`options` defaults to:

```js
{
  // Global variable name
  globalName: '__APOLLO_STATE__',
  // Global object on which the variable is set
  attachTo: 'window',
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

## Other methods

### willPrefetch

Tells vue-apollo that some components not used in a `router-view` (and thus, not in vue-router `matchedComponents`) need to be prefetched, with the `willPrefetch` method:

```js
import { willPrefetch } from 'vue-apollo'

export default willPrefetch({
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      prefetch: true, // Don't forget this
    }
  }
})
```

