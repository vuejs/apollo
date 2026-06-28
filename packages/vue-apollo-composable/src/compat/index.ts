/**
 * v4-compatible API surface for `@vue/apollo-composable`.
 *
 * Import composables from `@vue/apollo-composable/compat` to keep using v4-style
 * call signatures (positional variables, `mutate(variables, overrideOptions)`, flat refs only)
 * while the rest of your application is migrated to the v5 API.
 *
 * Everything in this module that is not a v4-style wrapper is re-exported from the main entry.
 *
 * @module
 */

// Unchanged composables and helpers, re-exported from the main entry so callers
// can switch imports wholesale during migration.
export {
  ApolloClients,
  DefaultApolloClient,
  provideApolloClient,
  provideApolloClients,
  useApolloClient,
  useFragment,
  useGlobalMutationLoading,
  useGlobalQueryLoading,
  useGlobalSubscriptionLoading,
  useMutationLoading,
  useQueryLoading,
  useSubscriptionLoading,
} from '../index.ts'

export type { RenameKey } from '../util/types.ts'

export {
  useLazyQuery,
  type UseLazyQueryReturn,
} from './useLazyQuery.ts'

export {
  type MutateFunction,
  type MutateOverrideOptions,
  type MutateResult,
  type MutateResultV4,
  useMutation,
  type OnDoneContext as UseMutationOnDoneContext,
  type OnErrorContext as UseMutationOnErrorContext,
  type UseMutationOptions,
  type UseMutationReturn,
} from './useMutation.ts'

// v4-style wrappers (this folder)
export {
  type ApolloFetchMoreResultV4,
  type ApolloQueryResultV4,
  type DocumentParameter,
  type OptionsParameter,
  useQuery,
  type OnErrorContext as UseQueryOnErrorContext,
  type OnResultContext as UseQueryOnResultContext,
  type UseQueryOptions,
  type UseQueryReturn,
  type VariablesParameter,
} from './useQuery.ts'

export {
  type SubscriptionResultV4,
  useSubscription,
  type OnErrorContext as UseSubscriptionOnErrorContext,
  type OnResultContext as UseSubscriptionOnResultContext,
  type UseSubscriptionOptions,
  type UseSubscriptionReturn,
} from './useSubscription.ts'

import type { useApolloClient as useApolloClientV5 } from '../useApolloClient.ts'

/**
 * v4 alias for the `useApolloClient` return type. The `TCacheShape` generic
 * is no longer carried by Apollo Client v4 and is ignored at runtime.
 */
export type UseApolloClientReturn<_TCacheShape = unknown> = useApolloClientV5.Result
