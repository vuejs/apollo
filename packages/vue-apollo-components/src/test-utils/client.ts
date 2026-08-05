import type { ApolloClient as ApolloClientType, TypedDocumentNode } from '@apollo/client'
import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { MockLink, MockSubscriptionLink } from '@apollo/client/testing'

export interface Thing { __typename: 'Thing', id: string }
export interface ThingsData { things: Thing[] }
export interface ThingsVars { term: string }

export const THINGS_QUERY = gql`
  query Things($term: String!) {
    things(term: $term) {
      id
    }
  }
` as TypedDocumentNode<ThingsData, ThingsVars>

export const ADD_THING = gql`
  mutation AddThing($id: String!) {
    addThing(id: $id) {
      id
    }
  }
` as TypedDocumentNode<{ addThing: Thing }, { id: string }>

export const THING_ADDED = gql`
  subscription ThingAdded($term: String!) {
    thingAdded(term: $term) {
      id
    }
  }
` as TypedDocumentNode<{ thingAdded: Thing }, ThingsVars>

export function mock(term: string, ids: string[], options: { delay?: number, error?: Error } = {}) {
  return {
    request: { query: THINGS_QUERY, variables: { term } },
    maxUsageCount: Number.POSITIVE_INFINITY,
    delay: options.delay ?? 20,
    ...(options.error
      ? { error: options.error }
      : { result: { data: { things: ids.map(id => ({ __typename: 'Thing', id })) } } }),
  }
}

export const THING_FRAGMENT = gql`
  fragment ThingFields on Thing {
    id
    label
  }
` as TypedDocumentNode<{ id: string, label: string }, Record<string, never>>

export function mockMutation(id: string) {
  return {
    request: { query: ADD_THING, variables: { id } },
    maxUsageCount: Number.POSITIVE_INFINITY,
    delay: 20,
    result: { data: { addThing: { __typename: 'Thing', id } } },
  }
}

export function createMockClient(mocks: readonly unknown[]) {
  return new ApolloClient({
    link: new MockLink(mocks as never, { showWarnings: false }),
    cache: new InMemoryCache(),
  })
}

/** Client whose subscriptions are driven by the returned link. */
export function createSubscriptionClient() {
  const link = new MockSubscriptionLink()
  const client = new ApolloClient({ link, cache: new InMemoryCache() })
  return { client, link }
}

/** Records the options each `watchQuery` actually receives. */
export function captureWatchQuery(client: ApolloClientType) {
  const calls: Record<string, unknown>[] = []
  const original = client.watchQuery.bind(client)

  client.watchQuery = ((options: never) => {
    calls.push(options)
    return original(options)
  }) as typeof client.watchQuery

  return calls
}

/** Records the options each `watchFragment` actually receives. */
export function captureWatchFragment(client: ApolloClientType) {
  const calls: Record<string, unknown>[] = []
  const original = client.watchFragment.bind(client)

  client.watchFragment = ((options: never) => {
    calls.push(options)
    return original(options)
  }) as typeof client.watchFragment

  return calls
}
