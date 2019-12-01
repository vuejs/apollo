import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { createApolloClient, restartWebsockets } from 'vue-cli-plugin-apollo/graphql-client'
import { logErrorMessages } from '@vue/apollo-util'
// import { print } from 'graphql'
import { onError } from 'apollo-link-error'

// Install the vue plugin
Vue.use(VueApollo)

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

// Config
const defaultOptions = {
  // You can use `https` for secure connection (recommended in production)
  httpEndpoint: process.env.VUE_APP_GRAPHQL_HTTP || 'http://localhost:4042/graphql',
  // You can use `wss` for secure connection (recommended in production)
  // Use `null` to disable subscriptions
  wsEndpoint: process.env.VUE_APP_GRAPHQL_WS || 'ws://localhost:4042/graphql',
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
  apollo: {
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  },
  getAuth: tokenName => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem(tokenName)
    // return the headers to the context so httpLink can read them
    return token || ''
  },
}

// Call this in the Vue app file
export function createClient (options = {}, { router }) {
  const errorLink = onError(error => {
    if (process.env.NODE_ENV !== 'production') {
      logErrorMessages(error, false)
    }

    if (isUnauthorizedError(error) && router.currentRoute.matched.some(m => m.meta.private)) {
      // Redirect to login page
      if (router.currentRoute.name !== 'login') {
        router.replace({
          name: 'login',
          params: {
            wantedRoute: router.currentRoute.fullPath,
          },
        })
      }
    }
  })

  // Create apollo client
  const { apolloClient, wsClient } = createApolloClient({
    ...defaultOptions,
    ...options,
    link: errorLink,
  })
  apolloClient.wsClient = wsClient
  return apolloClient
}

// Manually call this when user log in
export async function onLogin (apolloClient, token) {
  localStorage.setItem(AUTH_TOKEN, JSON.stringify(token))
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (login)', 'color: orange;', e.message)
    }
  }
}

// Manually call this when user log out
export async function onLogout (apolloClient) {
  localStorage.removeItem(AUTH_TOKEN)
  if (apolloClient.wsClient) restartWebsockets(apolloClient.wsClient)
  try {
    await apolloClient.resetStore()
  } catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
    }
  }
}

function isUnauthorizedError ({ graphQLErrors }) {
  return (graphQLErrors && graphQLErrors.some(e => e.message === 'Unauthorized'))
}
