import { inject } from '@vue/composition-api'
import ApolloClient from 'apollo-client'

export const DefaultApolloClient = Symbol('default-apollo-client')
export const ApolloClients = Symbol('apollo-clients')

export function useApolloClient<TCacheShape = any> (clientId: string = null) {
  const providedApolloClients: { [key: string]: ApolloClient<TCacheShape> } = inject(ApolloClients, null)
  const providedApolloClient: ApolloClient<TCacheShape> = inject(DefaultApolloClient, null)
  
  function resolveClient (clientId: string = null): ApolloClient<TCacheShape> {
    let resolvedClient
    if (clientId) {
      if (!providedApolloClients) {
        throw new Error(`No apolloClients injection found, tried to resolve '${clientId}' clientId`)
      }
      resolvedClient = providedApolloClients[clientId]
    } else {
      clientId = 'default'
      if (providedApolloClients) {
        resolvedClient = providedApolloClients.default
      } else {
        resolvedClient = providedApolloClient
      }
    }
    if (!resolvedClient) {
      throw new Error(`Apollo Client with id ${clientId} not found`)
    }
    return resolvedClient
  }

  return {
    resolveClient,
    get client () {
      return resolveClient(clientId)
    }
  }
}