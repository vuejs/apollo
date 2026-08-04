import type { ApolloClient } from '@apollo/client'
import { ApolloClients, DefaultApolloClient } from '@vue/apollo-composable'
import { nextTick } from 'vue'

/** `until()` cannot watch a DOM query, so poll. */
export async function waitFor(predicate: () => boolean, timeout = 2000) {
  const deadline = Date.now() + timeout
  while (!predicate()) {
    if (Date.now() > deadline) {
      throw new Error('waitFor timed out')
    }
    await new Promise(resolve => setTimeout(resolve, 5))
    await nextTick()
  }
}

export function provideClient(client: ApolloClient) {
  return { provide: { [DefaultApolloClient as symbol]: client } }
}

/** For `clientId`, which resolves against the `ApolloClients` map rather than the default. */
export function provideClients(clients: Record<string, ApolloClient>, defaultClient?: ApolloClient) {
  return {
    provide: {
      [ApolloClients as symbol]: clients,
      ...(defaultClient == null ? {} : { [DefaultApolloClient as symbol]: defaultClient }),
    },
  }
}
