// app.js

import VueApollo from 'vue-apollo'

Vue.use(VueApollo)

export default function createApp ({ createApolloClients }) {
  const router = new VueRouter({})
  const store = new Vuex.Store({})
  const { apolloClientA, apolloClientB } = createApolloClients()
  const apollo = new VueApollo({
    clients: {
      a: apolloClientA,
      b: apolloClientB,
    },
    defaultClient: apolloClientA,
  })

  const ensureReady = apollo.collect()

  const app = new Vue({
    el: '#app',
    router,
    store,
    apollo,
    ...App,
  })

  return { app, router, store, apollo, ensureReady }
}

// server.js

import { ApolloClient, createNetworkInterface } from 'apollo-client'
import { createLocalInterface } from 'apollo-local-query'
import graphql from 'graphql'
import { schema } from './graphql/schema'

function createApolloClients() {
  const apolloClientA = new ApolloClient({
    ssrMode: true,
    networkInterface: createLocalInterface(graphql, schema)
  })

  const apolloClientB = new ApolloClient({
    ssrMode: true,
    networkInterface: createNetworkInterface({
      uri: 'http://my-awesome-api/graphql',
      transportBatching: true,
    }),
  })

  return {
    apolloClientA,
    apolloClientB,
  }
}

export default function render (context) {
  const { app, router, store, apollo, ensureReady } = createApp({ createApolloClients })
  router.push(context.url)
  router.onReady(async () => {
    // Wait for apollo queries to be loaded
    await ensureReady()

    // Inject initial apollo states
    let js = `window.__APOLLO_STATE__ = {`
    for (const key in apollo.clients) {
      const client = apollo.clients[key]
      const state = {[client.reduxRootKey]: client.getInitialState() }
      js += `['${key}']:${JSON.stringify(state)},`
    }
    js += `};`

    // TODO Render here

    // TODO Add the js to the response
  })
}

// client.js

import { ApolloClient, createNetworkInterface } from 'apollo-client'

function createApolloClients() {
  const state = window.__APOLLO_STATE__

  const apolloClientA = new ApolloClient({
    networkInterface: createNetworkInterface({
      uri: '/graphql',
      transportBatching: true,
    }),
    initialState: state.a,
    ssrForceFetchDelay: 100,
  })

  const apolloClientB = new ApolloClient({
    networkInterface: createNetworkInterface({
      uri: 'http://my-awesome-api/graphql',
      transportBatching: true,
    }),
    initialState: state.b,
    ssrForceFetchDelay: 100,
  })

  export {
    apolloClientA,
    apolloClientB,
  }
}

createApp({ createApolloClients })
