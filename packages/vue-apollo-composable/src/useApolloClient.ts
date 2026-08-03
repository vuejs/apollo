import type { ApolloClient } from '@apollo/client'
import { hasInjectionContext, inject } from '@vue/runtime-core'

// #region Module State
/**
 * Module-level client storage for use outside Vue's injection context.
 * @internal
 */
let currentApolloClients: useApolloClient.ClientDict = {}
// #endregion

// #region Symbols
/**
 * Vue injection key for providing a single default ApolloClient.
 *
 * @group Injection Keys
 *
 * @example
 * ```ts
 * // In a plugin or main.ts
 * app.provide(DefaultApolloClient, apolloClient)
 *
 * // In a parent component
 * provide(DefaultApolloClient, apolloClient)
 *
 * // In a child component
 * const client = inject(DefaultApolloClient)
 * ```
 */
export const DefaultApolloClient = Symbol('default-apollo-client')

/**
 * Vue injection key for providing multiple named ApolloClient instances.
 *
 * @group Injection Keys
 *
 * @example
 * ```ts
 * // In a plugin or main.ts
 * app.provide(ApolloClients, {
 *   default: mainClient,
 *   analytics: analyticsClient,
 * })
 *
 * // In a parent component
 * provide(ApolloClients, {
 *   default: mainClient,
 *   analytics: analyticsClient,
 * })
 *
 * // In a child component
 * const clients = inject(ApolloClients)
 * ```
 */
export const ApolloClients = Symbol('apollo-clients')
// #endregion

// #region Types
export declare namespace useApolloClient {
  import _self = useApolloClient

  /** Identifier for a named Apollo client. Use `'default'` for the default client. */
  export type ClientId = string

  /** Dictionary mapping client IDs to ApolloClient instances. */
  export type ClientDict = Record<ClientId, ApolloClient>

  /**
   * Function for resolving an Apollo client by ID.
   *
   * @param clientId - The client ID to resolve. If omitted, resolves the default client.
   */
  export type ResolveClient<TReturn = ApolloClient> = (clientId?: ClientId) => TReturn

  /** An ApolloClient instance or undefined. */
  export type NullableApolloClient = ApolloClient | undefined

  export namespace Base {
    export interface Result {
      /**
       * Resolves an ApolloClient by ID.
       */
      resolveClient: ResolveClient

      /** The ApolloClient instance. */
      readonly client: ApolloClient
    }
  }

  /** Result returned by useApolloClient. */
  export interface Result extends Base.Result {}

  export namespace DocumentationTypes {
    /** @group Providers Namespaces */
    namespace useApolloClient {
      /** {@inheritDoc @vue/apollo-composable!useApolloClient.Result:interface} */
      export interface Result extends _self.Result {
        /**
         * {@inheritDoc @vue/apollo-composable!useApolloClient.Base.Result#resolveClient:member}
         *
         * @param clientId - The client ID to resolve. If omitted, resolves the default client.
         */
        resolveClient: (clientId?: ClientId) => ApolloClient
      }

    }
    /**
     * {@inheritDoc @vue/apollo-composable!useApolloClient:function(1)}
     */
    export function useApolloClient(
      clientId?: ClientId,
    ): useApolloClient.Result
  }
}
// #endregion

// #region Helpers
function resolveDefaultClient(
  providedApolloClients: useApolloClient.ClientDict | null | undefined,
  providedApolloClient: ApolloClient | null | undefined,
): useApolloClient.NullableApolloClient {
  const resolvedClient = providedApolloClients
    ? providedApolloClients.default
    : (providedApolloClient ?? undefined)
  return resolvedClient
}

function resolveClientWithId(
  providedApolloClients: useApolloClient.ClientDict | null | undefined,
  clientId: useApolloClient.ClientId,
): useApolloClient.NullableApolloClient {
  return providedApolloClients?.[clientId]
}
// #endregion

// #region Main Composable
/**
 * Composable to access ApolloClient instances.
 *
 * Must be provided using {@link DefaultApolloClient} or {@link ApolloClients}.
 * Alternatively, can be used inside a {@link provideApolloClient} or {@link provideApolloClients} context.
 *
 * @param clientId - Client ID to resolve. Defaults to the default client.
 * @returns Object with `client` property.
 *
 * @group Providers
 *
 * @example
 * ```ts
 * // Get the default client
 * const { client } = useApolloClient()
 *
 * // Get a named client
 * const { client } = useApolloClient('analytics')
 * ```
 */
export function useApolloClient(clientId?: useApolloClient.ClientId): useApolloClient.Result {
  let resolveImpl: useApolloClient.ResolveClient<useApolloClient.NullableApolloClient>

  // Capture module state at call time (it may change, but we want the value from when this was called)
  const savedCurrentClients = currentApolloClients

  // Build resolution strategy based on whether we're in a Vue injection context
  if (!hasInjectionContext()) {
    // Outside component setup: only use module-level state
    resolveImpl = (id?: useApolloClient.ClientId) => {
      if (id) {
        return resolveClientWithId(savedCurrentClients, id)
      }
      return resolveDefaultClient(savedCurrentClients, savedCurrentClients.default)
    }
  }
  else {
    // Inside component setup: try injection first, fall back to module state
    const providedApolloClients: useApolloClient.ClientDict | null = inject(ApolloClients, null)
    const providedApolloClient: ApolloClient | null = inject(DefaultApolloClient, null)

    resolveImpl = (id?: useApolloClient.ClientId) => {
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

  function resolveClient(id: useApolloClient.ClientId | undefined = clientId) {
    const client = resolveImpl(id)
    if (!client) {
      throw new Error(
        `Apollo client with id ${id ?? 'default'} not found. Use an app.runWithContext() or provideApolloClient() if you are outside of a component setup.`,
      )
    }
    return client
  }

  return {
    resolveClient,
    get client() {
      return resolveClient()
    },
  }
}
// #endregion

// #region Utilities
export declare namespace provideApolloClient {
  export type Callback<TFnResult> = () => TFnResult

  export type Result = <TFnResult>(fn: Callback<TFnResult>) => TFnResult

  export namespace DocumentationTypes {
    /** @group Providers Namespaces */
    export namespace provideApolloClient {
      /**
       * Callback used in {@link provideApolloClient}.
       */
      export type Callback = () => any

      /**
       * Result type returned by {@link provideApolloClient}.
       */
      export type Result = (fn: Callback) => any
    }
    /** {@inheritDoc @vue/apollo-composable!provideApolloClient:function(1)} */
    export function provideApolloClient(
      client: ApolloClient,
    ): provideApolloClient.Result
  }
}

/**
 * Provides an ApolloClient for use outside Vue's injection context.
 *
 * @param client - The ApolloClient instance to provide.
 * @returns A function that executes a callback with the client available.
 *
 * @group Providers
 *
 * @example
 * ```ts
 * const { current } = provideApolloClient(client)(() => {
 *   return useQuery(MyQuery)
 * })
 * ```
 */
export function provideApolloClient(client: ApolloClient): provideApolloClient.Result {
  currentApolloClients = {
    default: client,
  }
  return function <TFnResult = any>(fn: () => TFnResult) {
    const result = fn()
    currentApolloClients = {}
    return result
  }
}

export declare namespace provideApolloClients {
  export type Callback<TFnResult> = () => TFnResult
  export type Result = <TFnResult>(fn: Callback<TFnResult>) => TFnResult

  export namespace DocumentationTypes {
    /** @group Providers Namespaces */
    export namespace provideApolloClients {
      /**
       * Callback used in {@link provideApolloClients}.
       */
      export type Callback = () => any

      /**
       * Result type returned by {@link provideApolloClients}.
       */
      export type Result = (fn: Callback) => any
    }
    /** {@inheritDoc @vue/apollo-composable!provideApolloClients:function(1)} */
    export function provideApolloClients(
      clients: useApolloClient.ClientDict,
    ): provideApolloClients.Result
  }
}

/**
 * Provides multiple named ApolloClient instances for use outside Vue's injection context.
 *
 * @param clients - Dictionary mapping client IDs to ApolloClient instances.
 * @returns A function that executes a callback with the clients available.
 *
 * @group Providers
 *
 * @example
 * ```ts
 * const { current } = provideApolloClients({
 *   default: mainClient,
 *   analytics: analyticsClient,
 * })(() => {
 *   return useQuery(MyQuery, { clientId: 'analytics' })
 * })
 * ```
 */
export function provideApolloClients(clients: useApolloClient.ClientDict): provideApolloClients.Result {
  currentApolloClients = clients
  return function <TFnResult = any>(fn: () => TFnResult) {
    const result = fn()
    currentApolloClients = {}
    return result
  }
}
// #endregion
