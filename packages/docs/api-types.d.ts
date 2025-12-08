/**
 * Vue Apollo Composable - API Documentation Types
 *
 * @packageDocumentation
 */

import type {
  provideApolloClient as _provideApolloClient,
  provideApolloClients as _provideApolloClients,
  useApolloClient as _useApolloClient,
  useFragment as _useFragment,
  useLazyQuery as _useLazyQuery,
  useMutation as _useMutation,
  useQuery as _useQuery,
  useSubscription as _useSubscription,
} from '@vue/apollo-composable'

// Re-export
export {
  ApolloClients,
  DefaultApolloClient,
  useGlobalMutationLoading,
  useGlobalQueryLoading,
  useGlobalSubscriptionLoading,
  useMutationLoading,
  useQueryLoading,
  useSubscriptionLoading,
} from '@vue/apollo-composable'

// Re-export DocumentationTypes from each composable
export import provideApolloClient = _provideApolloClient.DocumentationTypes.provideApolloClient
export import provideApolloClients = _provideApolloClients.DocumentationTypes.provideApolloClients
export import useApolloClient = _useApolloClient.DocumentationTypes.useApolloClient
export import useFragment = _useFragment.DocumentationTypes.useFragment
export import useLazyQuery = _useLazyQuery.DocumentationTypes.useLazyQuery
export import useMutation = _useMutation.DocumentationTypes.useMutation
export import useQuery = _useQuery.DocumentationTypes.useQuery
export import useSubscription = _useSubscription.DocumentationTypes.useSubscription
