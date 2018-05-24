import Vue from 'vue'
import VueApollo from '../../../'
import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint: process.env.VUE_APP_GRAPHQL_HTTP || 'http://localhost:4000/graphql',
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4000/graphql',
  // LocalStorage token
  tokenName: AUTH_TOKEN,
  // Enable Automatic Query persisting with Apollo Engine
  persisting: false,
  // Use websockets for everything (no HTTP)
  // You need to pass a `wsEndpoint` for this to work
  websocketsOnly: false,
  // Is being rendered on the server?
  ssr: false,
  // Override default http link
  // link: myLink,
  // Override default cache
  // cache: myCache,
  // Additional ApolloClient options
  // apollo: { ... }
}

// Call this in the Vue app file
export function createProvider (options = {}) {
  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options,
  })
  apolloClient.wsClient = wsClient

  // Create vue apollo provider
  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
    defaultOptions: {
      $query: {
        fetchPolicy: 'cache-and-network',
      },
    },
  })

  return apolloProvider
}

// Manually call this when user log in
export function onLogin (apolloClient, token) {
  localStorage.setItem(AUTH_TOKEN, token)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
}

// Manually call this when user log out
export function onLogout (apolloClient) {
  localStorage.removeItem(AUTH_TOKEN)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  apolloClient.resetStore()
}
