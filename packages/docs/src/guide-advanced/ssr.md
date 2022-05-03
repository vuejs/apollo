# Server-Side Rendering

::: danger Outdated
This guide is outdated and needs rework for Vue 3 and vue-apollo 4. Contributions welcome!
:::

::: warning
**Requires Vue 2.6+ with `serverPrefetch` support**
:::

## Vue CLI plugin

I made a plugin for [vue-cli](http://cli.vuejs.org) so you can transform your `vue-apollo` app into an isomorphic SSR app in literary two minutes! ✨🚀

In your vue-cli 3 project:

```bash
vue add @akryum/ssr
```

[More info](https://github.com/Akryum/vue-cli-plugin-ssr)

## Component prefetching

Install the SSR utils with:

```shell
npm install --save @vue/apollo-ssr
```

Or:

```shell
yarn add @vue/apollo-ssr
```

::: tip
Follow the [offical SSR guide](https://ssr.vuejs.org) to learn more about Server-Side Rendering with Vue.
:::

By default with `vue-server-renderer`, all the GraphQL queries in your server-side rendered components will be prefetched automatically.

::: tip
You have access to `this` in options like `variables`, even on the server!
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
      variables () {
        return {
          id: this.id,
        }
      },
    }
  }
}
```

## Skip prefetching

You can skip server-side prefetching on a query with the `prefetch` option set to `false`.

Example that doesn't prefetch the query:

```js{12}
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
      // Don't prefetch
      prefetch: false,
    }
  }
}
```

If you want to skip prefetching all the queries for a specific component, use the `$prefetch` option:

```js{4}
export default {
  apollo: {
    // Don't prefetch any query
    $prefetch: false,
    allPosts: {
      query: gql`query AllPosts {
        allPosts {
          id
          imageUrl
          description
        }
      }`,
    }
  }
}
```

## Create Apollo client

It is recommended to create the apollo clients inside a function with an `ssr` argument, which is `true` on the server and `false` on the client.

If `ssr` is false, we try to restore the state of the Apollo cache with `cache.restore`, by getting the `window.__APOLLO_STATE__` variable that we will inject in the HTML page on the server during SSR.

Here is an example:

```js{21-30}
// apollo.js

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'

// Create the apollo client
export function createApolloClient (ssr = false) {
  const httpLink = new HttpLink({
    // You should use an absolute URL here
    uri: ENDPOINT + '/graphql',
  })

  const cache = new InMemoryCache()

  // If on the client, recover the injected state
  if (!ssr) {
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

## Create app

Instead of creating our root Vue instance right away, we use a `createApp` function that accept a `context` parameter.

This function will be used both on the client and server entries with a different `ssr` value in the context. We use this value in the `createApolloClient` method we wrote previously.

Example for common `createApp` method:

```js{9,37}
// app.js

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'

import VueApollo from '@vue/apollo-option'
import { createApolloClient } from './apollo'

import App from './ui/App.vue'
import routes from './routes'
import storeOptions from './store'

function createMyApp (context) {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  const store = createStore(storeOptions)

  // Vuex state restoration
  if (!context.ssr && window.__INITIAL_STATE__) {
    // We initialize the store state with the data injected from the server
    store.replaceState(window.__INITIAL_STATE__)
  }

  // Apollo
  const apolloClient = createApolloClient(context.ssr)
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
  })

  const app = createApp(App)
  app.use(router)
  app.use(store)
  app.use(apolloProvider)

  return {
    app,
    router,
    store,
    apolloProvider,
  }
}

export default createMyApp
```

## Client entry

The client entry is very simple -- we just call `createApp` with `ssr` being `false`:

```js
// client-entry.js

import createApp from './app'

createApp({
  ssr: false,
}).mount('#app')
```

## Server entry

Nothing special is required apart from storing the Apollo cache to inject it in the client HTML. Learn more about [server entry with routing](https://ssr.vuejs.org/guide/routing.html#routing-with-vue-router) and [data prefetching](https://ssr.vuejs.org/guide/data.html#data-store) in the official SSR guide.

Here is an example with vue-router and a Vuex store:

```js{3,26}
// server-entry.js

import * as ApolloSSR from '@vue/apollo-ssr'
import createApp from './app'

export default () => new Promise((resolve, reject) => {
  const { app, router, store, apolloProvider } = createApp({
    ssr: true,
  })

  // set router's location
  router.push(context.url)

  // wait until router has resolved possible async hooks
  router.onReady(() => {
    // This `rendered` hook is called when the app has finished rendering
    context.rendered = () => {
      // After the app is rendered, our store is now
      // filled with the state from our components.
      // When we attach the state to the context, and the `template` option
      // is used for the renderer, the state will automatically be
      // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
      context.state = store.state

      // ALso inject the apollo cache state
      context.apolloState = ApolloSSR.getStates(apolloProvider.clients)
    }
    resolve(app)
  })
})
```

Use the [ApolloSSR.getStates](../api/ssr.md#getstates) method to get the JavaScript code you need to inject into the generated page to pass the apollo cache data to the client.

In the [page template](https://ssr.vuejs.org/guide/#using-a-page-template), use the `renderState` helper:

```html
{{{ renderState({ contextKey: 'apolloState', windowKey: '__APOLLO_STATE__' }) }}}
```

Here is a full example:

```html{15}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="<%= BASE_URL %>favicon.ico">
    <title>{{ title }}</title>
    {{{ renderResourceHints() }}}
    {{{ renderStyles() }}}
  </head>
  <body>
    <!--vue-ssr-outlet-->
    {{{ renderState() }}}
    {{{ renderState({ contextKey: 'apolloState', windowKey: '__APOLLO_STATE__' }) }}}
    {{{ renderScripts() }}}
  </body>
</html>
```
