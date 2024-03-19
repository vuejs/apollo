import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { logErrorMessages } from '@vue/apollo-util'
import { createClient } from 'graphql-ws'

const cache = new InMemoryCache()

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:4042/graphql',
})

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:4042/graphql',
}))

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    if (definition.kind === 'OperationDefinition' &&
    definition.operation === 'subscription') {
      console.log(`Subscribing to ${definition.name?.value ?? 'anonymous'}`)
    }
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink,
)

// Handle errors
const errorLink = onError(error => {
  logErrorMessages(error)
})

export const apolloClient = new ApolloClient({
  cache,
  link: errorLink.concat(splitLink),
})
