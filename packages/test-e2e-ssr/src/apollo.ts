import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'
import { isServer } from './env.js'

export function createApollo() {
  const cache = new InMemoryCache()

  const restoreCache = !isServer && !!window._INITIAL_STATE_?.apollo
  if (restoreCache) {
    cache.restore(window._INITIAL_STATE_.apollo)
  }

  // HTTP connection to the API
  const httpLink = createHttpLink({
    // You should use an absolute URL here
    uri: 'http://localhost:4042/graphql',
  })

  // Handle errors
  const errorLink = onError((error) => {
    logErrorMessages(error)
  })

  const apolloClient = new ApolloClient({
    cache,
    link: errorLink.concat(httpLink),
    ssrForceFetchDelay: restoreCache ? 100 : undefined,
    ssrMode: isServer,
  })

  return {
    apolloClient,
  }
}
