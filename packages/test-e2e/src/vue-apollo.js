import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { createApolloProvider } from '@vue/apollo-option'
import { print } from 'graphql'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import MessageTypes from 'subscriptions-transport-ws/dist/message-types'
import router from './router'

// Name of the localStorage item
const AUTH_TOKEN = 'apollo-token'

function getAuth() {
  return localStorage.getItem(AUTH_TOKEN) || ''
}

const cache = new InMemoryCache()

let link = new HttpLink({
  uri: 'http://localhost:4042/graphql',
})

link = setContext(async (_, { headers }) => {
  const Authorization = getAuth()
  const authorizationHeader = Authorization ? { Authorization } : {}
  return {
    headers: {
      ...headers,
      ...authorizationHeader,
    },
  }
}).concat(link)

const wsClient = new SubscriptionClient('ws://localhost:4042/graphql', {
  reconnect: true,
  connectionParams: () => {
    const Authorization = getAuth()
    return Authorization ? { Authorization, headers: { Authorization } } : {}
  },
})

const wsLink = new WebSocketLink(wsClient)

link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition'
      && operation === 'subscription'
  },
  wsLink,
  link,
)

export const apolloClient = new ApolloClient({
  cache,
  link,
})

export const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
  defaultOptions: {
    $query: {
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    },
  },
  errorHandler(error, vm, key, type, options) {
    console.log(router.currentRoute)
    if (isUnauthorizedError(error) && router.currentRoute.value.matched.some(m => m.meta.private)) {
      // Redirect to login page
      if (router.currentRoute.value.name !== 'login') {
        router.replace({
          name: 'login',
          params: {
            wantedRoute: router.currentRoute.value.fullPath,
          },
        })
      }
    }
    else {
      console.log(
        '%cError',
        'background: red; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;',
        type,
        key,
        vm.$el,
        error.message,
        '\n\n',
        print(options.query),
        `\n`,
        options,
      )
    }
  },
})

function restartWebsockets() {
  // Copy current operations
  const operations = Object.assign({}, wsClient.operations)

  // Close connection
  wsClient.close(true)

  // Open a new one
  wsClient.connect()

  // Push all current operations to the new connection
  Object.keys(operations).forEach((id) => {
    wsClient.sendMessage(
      id,
      MessageTypes.GQL_START,
      operations[id].options,
    )
  })
}

// Manually call this when user log in
export async function onLogin(apolloClient, token) {
  localStorage.setItem(AUTH_TOKEN, JSON.stringify(token))
  restartWebsockets()
  try {
    await apolloClient.resetStore()
  }
  catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (login)', 'color: orange;', e.message)
    }
  }
}

// Manually call this when user log out
export async function onLogout(apolloClient) {
  localStorage.removeItem(AUTH_TOKEN)
  restartWebsockets()
  try {
    await apolloClient.resetStore()
  }
  catch (e) {
    if (!isUnauthorizedError(e)) {
      console.log('%cError on cache reset (logout)', 'color: orange;', e.message)
    }
  }
}

function isUnauthorizedError(error) {
  const { graphQLErrors } = error
  return (graphQLErrors && graphQLErrors.some(e => e.message === 'Unauthorized'))
}
