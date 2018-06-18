# Server-Side Rendering

## Prefetch components

On the queries you want to prefetch on the server, add the `prefetch` option. It can either be:
 - a variables object,
 - a function that gets the context object (which can contain the URL for example) and return a variables object,
 - `true` (query's `variables` is reused).

If you are returning a variables object in the `prefetch` option, make sure it matches the result of the `variables` option. If they do not match, the query's data property will not be populated while rendering the template server-side.

::: danger
You don't have access to the component instance when doing prefetching on the server. Don't use `this` in `prefetch`!
:::

Example:

```js
export default {
  apollo: {
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
      prefetch: true,
    }
  }
}
```

Example 2:

```js
export default {
  apollo: {
    post: {
      query: gql`query Post($id: ID!) {
        post (id: $id) {
          id
          imageUrl
          description
        }
      }`,
      prefetch: ({ route }) => {
        return {
          id: route.params.id,
        }
      },
      variables () {
        return {
          id: this.id,
        }
      },
    }
  }
}
```

You can also tell vue-apollo that some components not used in a `router-view` (and thus, not in vue-router `matchedComponents`) need to be prefetched, with the `willPrefetch` method:

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

The second parameter is optional: it's a callback that gets the context and should return a boolean indicating if the component should be prefetched:

```js
willPrefetch({
  // Component definition...
}, context => context.url === '/foo')
```

## On the server

To prefetch all the apollo queries you marked, use the `apolloProvider.prefetchAll` method. The first argument is the context object passed to the `prefetch` hooks (see above). It is recommended to pass the vue-router `currentRoute` object. The second argument is the array of component definition to include (e.g. from `router.getMatchedComponents` method). The third argument is an optional `options` object. It returns a promise resolved when all the apollo queries are loaded.

Here is an example with vue-router and a Vuex store:

```js
return new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = CreateApp({
    ssr: true,
  })

  // set router's location
  router.push(context.url)

  // wait until router has resolved possible async hooks
  router.onReady(() => {
    const matchedComponents = router.getMatchedComponents()

    // no matched routes
    if (!matchedComponents.length) {
      reject({ code: 404 })
    }

    let js = ''

    // Call preFetch hooks on components matched by the route.
    // A preFetch hook dispatches a store action and returns a Promise,
    // which is resolved when the action is complete and store state has been
    // updated.
    Promise.all([
      // Vuex Store prefetch
      ...matchedComponents.map(component => {
        return component.preFetch && component.preFetch(store)
      }),
      // Apollo prefetch
      apolloProvider.prefetchAll({
        route: router.currentRoute,
      }, matchedComponents),
    ]).then(() => {
      // Inject the Vuex state and the Apollo cache on the page.
      // This will prevent unnecessary queries.

      // Vuex
      js += `window.__INITIAL_STATE__=${JSON.stringify(store.state)};`

      // Apollo
      js += apolloProvider.exportStates()

      resolve({
        app,
        js,
      })
    }).catch(reject)
  })
})
```

The `options` argument defaults to:

```js
{
  // Include components outside of the routes
  // that are registered with `willPrefetch`
  includeGlobal: true,
}
```

Use the `apolloProvider.exportStates` method to get the JavaScript code you need to inject into the generated page to pass the apollo cache data to the client.

It takes an `options` argument which defaults to:

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

You can also use the `apolloProvider.getStates` method to get the JS object instead of the script string.

It takes an `options` argument which defaults to:

```js
{
  // Prefix for the keys of each apollo client state
  exportNamespace: '',
}
```

### Creating the Apollo Clients

It is recommended to create the apollo clients inside a function with an `ssr` argument, which is `true` on the server and `false` on the client.

Here is an example:

```js
// src/api/apollo.js

import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'

// Install the vue plugin
Vue.use(VueApollo)

// Create the apollo client
export function createApolloClient (ssr = false) {
  const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: ENDPOINT + '/graphql',
  })

  const cache = new InMemoryCache()

  // If on the client, recover the injected state
  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }
  }

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache,
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true,
    } : {
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
    }),
  })

  return apolloClient
}
```

Example for common `CreateApp` method:

```js
import Vue from 'vue'

import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Vuex from 'vuex'
Vue.use(Vuex)

import { sync } from 'vuex-router-sync'

import VueApollo from 'vue-apollo'
import { createApolloClient } from './api/apollo'

import App from './ui/App.vue'
import routes from './routes'
import storeOptions from './store'

function createApp (context) {
  const router = new VueRouter({
    mode: 'history',
    routes,
  })

  const store = new Vuex.Store(storeOptions)

  // sync the router with the vuex store.
  // this registers `store.state.route`
  sync(store, router)

  // Apollo
  const apolloClient = createApolloClient(context.ssr)
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  })

  return {
    app: new Vue({
      el: '#app',
      router,
      store,
      provide: apolloProvider.provide(),
      ...App,
    }),
    router,
    store,
    apolloProvider,
  }
}

export default createApp
```

On the client:

```js
import CreateApp from './app'

CreateApp({
  ssr: false,
})
```

On the server:

```js
import { CreateApp } from './app'

const { app, router, store, apolloProvider } = CreateApp({
  ssr: true,
})

// set router's location
router.push(context.url)

// wait until router has resolved possible async hooks
router.onReady(() => {
  // Prefetch, render HTML (see above)
})
```