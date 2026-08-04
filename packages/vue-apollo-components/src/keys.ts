import type { OperationVariables } from '@apollo/client'
import type { useQuery } from '@vue/apollo-composable'
import type { InjectionKey } from 'vue'

/** Provided by `ApolloQuery` so a nested `ApolloSubscribeToMore` can extend it. */
export const ApolloQueryKey: InjectionKey<useQuery.Result<any, OperationVariables>>
  = Symbol('apollo-query')
