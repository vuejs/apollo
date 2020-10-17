import { getCurrentInstance, inject } from 'vue-demi'
import { ApolloClient } from '@apollo/client/core'

export const DefaultApolloClient = Symbol('default-apollo-client')
export const ApolloClients = Symbol('apollo-clients')

type ClientId = string
type ClientDict<T> = Record<ClientId, ApolloClient<T>>

type ResolveClient<TCacheShape, TReturn = ApolloClient<TCacheShape>> = (clientId?: ClientId) => TReturn
type NullableApolloClient<TCacheShape> = ApolloClient<TCacheShape> | undefined

export interface UseApolloClientReturn<TCacheShape> {
  resolveClient: ResolveClient<TCacheShape>
  readonly client: ApolloClient<TCacheShape>
}

function resolveDefaultClient<T> (providedApolloClients: ClientDict<T>, providedApolloClient: ApolloClient<T>): NullableApolloClient<T> {
  const resolvedClient = providedApolloClients
    ? providedApolloClients.default
    : providedApolloClient
  return resolvedClient
}

function resolveClientWithId<T> (providedApolloClients: ClientDict<T>, clientId: ClientId): NullableApolloClient<T> {
  if (!providedApolloClients) {
    throw new Error(`No apolloClients injection found, tried to resolve '${clientId}' clientId`)
  }
  return providedApolloClients[clientId]
}

export function useApolloClient<TCacheShape = any> (clientId?: ClientId): UseApolloClientReturn<TCacheShape> {
  let resolveImpl: ResolveClient<TCacheShape, NullableApolloClient<TCacheShape>>

  if (!getCurrentInstance()) {
    resolveImpl = () => currentApolloClient
  } else {
    const providedApolloClients: ClientDict<TCacheShape> = inject(ApolloClients, null)
    const providedApolloClient: ApolloClient<TCacheShape> = inject(DefaultApolloClient, null)

    resolveImpl = (id: ClientId) => {
      if (currentApolloClient) {
        return currentApolloClient
      } else if (id) {
        return resolveClientWithId(providedApolloClients, id)
      }
      return resolveDefaultClient(providedApolloClients, providedApolloClient)
    }
  }

  function resolveClient (id: ClientId = clientId) {
    const client = resolveImpl(id)
    if (!client) {
      throw new Error(`Apollo client with id ${id || 'default'} not found. Use provideApolloClient() if you are outside of a component setup.`)
    }
    return client
  }

  return {
    resolveClient,
    get client () {
      return resolveClient()
    },
  }
}

let currentApolloClient: ApolloClient<any>

export function provideApolloClient<TCacheShape = any> (client: ApolloClient<TCacheShape>) {
  currentApolloClient = client
  return function <TFnResult = any> (fn: () => TFnResult) {
    const result = fn()
    currentApolloClient = null
    return result
  }
}
