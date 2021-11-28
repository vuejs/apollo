import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import { logErrorMessages } from '@vue/apollo-util'

const cache = new InMemoryCache()

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:4042/graphql',
})

// Handle errors
const errorLink = onError(error => {
  logErrorMessages(error)
})

export const apolloClient = new ApolloClient({
  cache,
  link: errorLink.concat(httpLink),
})
