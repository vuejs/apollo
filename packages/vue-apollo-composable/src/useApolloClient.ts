import { inject } from '@vue/composition-api'
import ApolloClient from 'apollo-client'

export const DefaultApolloClient = Symbol('default-apollo-client')
export const ApolloClients = Symbol('apollo-clients')

export interface UseApolloClientReturn<TCacheShape> {
  resolveClient: (clientId?: string) => ApolloClient<TCacheShape>
  readonly client: ApolloClient<TCacheShape>
}

type ClientId = string
type ClientDict<T> = Record<ClientId, ApolloClient<T>>

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
  if (!providedApolloClients) {
    throw new Error(`No apolloClients injection found, tried to resolve '${clientId}' clientId`)
  }
  const resolvedClient = providedApolloClients[clientId]
  if (!resolvedClient) {
    throw new Error(`Apollo Client with id ${clientId} not found`)
  }
  return resolvedClient
}

export function useApolloClient<TCacheShape = any>(clientId?: ClientId): UseApolloClientReturn<TCacheShape> {
  const providedApolloClients: ClientDict<TCacheShape> = inject(ApolloClients, null)
  const providedApolloClient: ApolloClient<TCacheShape> = inject(DefaultApolloClient, null)

  function resolveClient() {
    if (clientId) {
      resolveClientWithId(providedApolloClients, clientId)
    }
    return resolveDefaultClient(providedApolloClients, providedApolloClient)
  }

  return {
    resolveClient,
    get client () {
      return resolveClient()
    }
  }
}
