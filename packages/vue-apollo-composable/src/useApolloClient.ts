import { getCurrentInstance, inject } from 'vue-demi'
import { ApolloClient } from '@apollo/client/core/index.js'

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

function resolveDefaultClient<T> (providedApolloClients: ClientDict<T> | null, providedApolloClient: ApolloClient<T> | null): NullableApolloClient<T> {
  const resolvedClient = providedApolloClients
    ? providedApolloClients.default
    : (providedApolloClient ?? undefined)
  return resolvedClient
}

function resolveClientWithId<T> (providedApolloClients: ClientDict<T> | null, clientId: ClientId): NullableApolloClient<T> {
  if (!providedApolloClients) {
    throw new Error(`No apolloClients injection found, tried to resolve '${clientId}' clientId`)
  }
  return providedApolloClients[clientId]
}

export function useApolloClient<TCacheShape = any> (clientId?: ClientId): UseApolloClientReturn<TCacheShape> {
  let resolveImpl: ResolveClient<TCacheShape, NullableApolloClient<TCacheShape>>

  // Save current client in current closure scope
  const savedCurrentClients = currentApolloClients

  if (!getCurrentInstance()) {
    resolveImpl = (id?: ClientId) => {
      if (id) {
        return resolveClientWithId(savedCurrentClients, id)
      }
      return resolveDefaultClient(savedCurrentClients, savedCurrentClients.default)
    }
  } else {
    const providedApolloClients: ClientDict<TCacheShape> | null = inject(ApolloClients, null)
    const providedApolloClient: ApolloClient<TCacheShape> | null = inject(DefaultApolloClient, null)

    resolveImpl = (id?: ClientId) => {
      if (id) {
        const client = resolveClientWithId(providedApolloClients, id)
        if (client) {
          return client
        }
        return resolveClientWithId(savedCurrentClients, id)
      }
      const client = resolveDefaultClient(providedApolloClients, providedApolloClient)
      if (client) {
        return client
      }
      return resolveDefaultClient(savedCurrentClients, savedCurrentClients.default)
    }
  }

  function resolveClient (id: ClientId | undefined = clientId) {
    const client = resolveImpl(id)
    if (!client) {
      throw new Error(
        `Apollo client with id ${
          id ?? 'default'
        } not found. Use provideApolloClient() if you are outside of a component setup.`,
      )
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

let currentApolloClients: ClientDict<any> = {}

export function provideApolloClient<TCacheShape = any> (client: ApolloClient<TCacheShape>) {
  currentApolloClients = {
    default: client,
  }
  return function <TFnResult = any> (fn: () => TFnResult) {
    const result = fn()
    currentApolloClients = {}
    return result
  }
}

export function provideApolloClients<TCacheShape = any> (clients: ClientDict<TCacheShape>) {
  currentApolloClients = clients
  return function <TFnResult = any> (fn: () => TFnResult) {
    const result = fn()
    currentApolloClients = {}
    return result
  }
}
