import { inject } from 'vue-demi'
import ApolloClient from 'apollo-client'

export const DefaultApolloClient = Symbol('default-apollo-client')
export const ApolloClients = Symbol('apollo-clients')

type ClientId = string
type ClientDict<T> = Record<ClientId, ApolloClient<T>>

export interface UseApolloClientReturn<TCacheShape> {
  resolveClient: (clientId?: ClientId) => ApolloClient<TCacheShape>
  readonly client: ApolloClient<TCacheShape>
}

function resolveDefaultClient<T>(providedApolloClients: ClientDict<T>, providedApolloClient: ApolloClient<T>): ApolloClient<T> {
  const resolvedClient = providedApolloClients ?
    providedApolloClients.default
    : providedApolloClient
  if (!resolvedClient) {
    throw new Error('Apollo Client with id default not found')
  }
  return resolvedClient
}

function resolveClientWithId<T>(providedApolloClients: ClientDict<T>, clientId: ClientId): ApolloClient<T> {
  const resolvedClient = providedApolloClients[clientId]
  if (!resolvedClient) {
    throw new Error(`Apollo Client with id ${clientId} not found`)
  }
  return resolvedClient
}

function assertProvidedApolloClients<T>(providedApolloClients: ClientDict<T>, clientId: ClientId) {
  if (!providedApolloClients) {
    throw new Error(`No apolloClients injection found, tried to resolve '${clientId}' clientId`)
  }
}

export function useApolloClient<TCacheShape = any>(clientId?: ClientId): UseApolloClientReturn<TCacheShape> {
  const providedApolloClients = inject<ClientDict<TCacheShape>>(ApolloClients, null)
  const providedApolloClient = inject<ApolloClient<TCacheShape>>(DefaultApolloClient, null)

  function resolveClient(clientId?: ClientId) {
    if (clientId) {
      assertProvidedApolloClients(providedApolloClients, clientId)
      return resolveClientWithId(providedApolloClients, clientId)
    }
    return resolveDefaultClient(providedApolloClients, providedApolloClient)
  }

  return {
    resolveClient,
    get client () {
      return resolveClient(clientId)
    }
  }
}
