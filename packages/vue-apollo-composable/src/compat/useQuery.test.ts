import type { ErrorPolicy, TypedDocumentNode } from '@apollo/client'
import type { MockedResponse } from '@apollo/client/testing'
import type { EffectScope } from '@vue/reactivity'
import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { effectScope } from '@vue/reactivity'
import { until } from '@vueuse/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { provideApolloClient } from '../useApolloClient.ts'
import { useLazyQuery, useQuery } from './index.ts'

const QUERY = gql`
  query Example {
    example
  }
` as TypedDocumentNode<{ example: string | null }, Record<string, never>>

const scopes: EffectScope[] = []
const clients: ApolloClient[] = []

function createClient(responses: MockedResponse[], errorPolicy?: ErrorPolicy) {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new MockLink(responses, { showWarnings: false }),
    defaultOptions: { watchQuery: errorPolicy ? { errorPolicy } : {} },
  })
  clients.push(client)
  return client
}

function inScope<T>(client: ApolloClient, fn: () => T): T {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(() => provideApolloClient(client)(fn))!
}

function success(value: string): MockedResponse {
  return {
    request: { query: QUERY },
    delay: 1,
    result: { data: { example: value } },
  }
}

function failure(kind: 'network' | 'graphql'): MockedResponse {
  return {
    request: { query: QUERY },
    delay: 1,
    ...(kind === 'network'
      ? { error: new Error('Request failed') }
      : { result: { data: { example: null }, errors: [{ message: 'Request failed' }] } }),
  }
}

afterEach(() => {
  scopes.splice(0).forEach(scope => scope.stop())
  clients.splice(0).forEach(client => client.stop())
})

describe('compat query error callbacks', () => {
  const policies = [
    { name: 'the default error policy', queryPolicy: undefined, clientPolicy: undefined },
    { name: 'errorPolicy none in query options', queryPolicy: 'none', clientPolicy: 'all' },
    { name: 'errorPolicy none in client defaults', queryPolicy: undefined, clientPolicy: 'none' },
  ] as const

  describe.each(policies)('$name', ({ queryPolicy, clientPolicy }) => {
    it.each(['network', 'graphql'] as const)('does not report a failed %s refetch as a result', async (kind) => {
      const client = createClient([success('before'), failure(kind), success('after')], clientPolicy)
      const query = inScope(client, () => useQuery(QUERY, undefined, queryPolicy ? { errorPolicy: queryPolicy } : {}))
      const onResult = vi.fn()
      const onError = vi.fn()
      query.onResult(onResult)
      query.onError(onError)

      await until(query.loading).toBe(false, { timeout: 1000, throwOnTimeout: true })
      expect(query.result.value).toEqual({ example: 'before' })
      onResult.mockClear()

      await expect(query.refetch()).rejects.toThrow('Request failed')
      expect(onError).toHaveBeenCalledTimes(1)
      expect(onResult.mock.calls.map(([result]) => result).filter(result => !result.loading)).toEqual([])
      expect(query.error.value?.message).toBe('Request failed')

      await query.refetch()
      expect(onResult).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { example: 'after' }, loading: false }),
        { client },
      )
    })

    it.each(['network', 'graphql'] as const)('rejects lazy load on a %s error', async (kind) => {
      const client = createClient([failure(kind)], clientPolicy)
      const query = inScope(client, () => useLazyQuery(QUERY, undefined, queryPolicy ? { errorPolicy: queryPolicy } : {}))
      const onResult = vi.fn()
      query.onResult(onResult)

      await expect(query.load()).rejects.toThrow('Request failed')
      expect(onResult.mock.calls.map(([result]) => result).filter(result => !result.loading)).toEqual([])
      expect(query.error.value?.message).toBe('Request failed')
    })
  })

  describe.each(['all', 'ignore'] as const)('errorPolicy %s', (errorPolicy) => {
    it.each(['query', 'client'] as const)('keeps partial results with the policy set on the %s', async (source) => {
      const client = createClient([failure('graphql')], source === 'client' ? errorPolicy : undefined)
      const query = inScope(client, () => useLazyQuery(QUERY, undefined, source === 'query' ? { errorPolicy } : undefined))
      const onResult = vi.fn()
      const onError = vi.fn()
      query.onResult(onResult)
      query.onError(onError)

      await expect(query.load()).resolves.toEqual({ example: null })
      expect(onResult).toHaveBeenLastCalledWith(
        expect.objectContaining({ data: { example: null }, loading: false }),
        { client },
      )
      expect(onError).toHaveBeenCalledTimes(errorPolicy === 'all' ? 1 : 0)
    })
  })
})
