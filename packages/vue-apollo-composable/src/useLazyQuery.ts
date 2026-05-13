import type { DocumentNode, MaybeMasked, OperationVariables, TypedDocumentNode } from '@apollo/client'
import type { MaybeRefOrGetter, ShallowRef } from '@vue/reactivity'
import type { useQuery } from './useQuery.ts'
import { until } from '@vueuse/core'
import { useQueryImpl } from './useQuery.ts'

// #region Types
export declare namespace useLazyQuery {
  // Re-export useQuery types for convenience
  export type { useQuery }

  /** Options for useLazyQuery - same as useQuery but `enabled` is not applicable. */
  export type Options<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Omit<useQuery.Options<TData, TVariables>, 'enabled'>

  /** Options when query is disabled. */
  export type DisabledOptions<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Omit<useQuery.DisabledOptions<TData, TVariables>, 'enabled'>

  /** Result returned by useLazyQuery - extends useQuery.Result with `load` function. */
  export interface Result<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > extends useQuery.Result<TData, TVariables> {
    /**
     * Load the query. Starts the query if not already started.
     *
     * Unlike `useQuery`, which executes immediately, `useLazyQuery` waits until
     * `load()` is called. After loading, the query behaves like a normal `useQuery`.
     *
     * @param variables - Optional variables to use for this load. If provided,
     *                    these will be merged with any variables from options.
     * @returns Promise resolving to the query result data when complete.
     *
     * @example
     * ```ts
     * const { load, result, loading } = useLazyQuery(GetUser)
     *
     * // Query doesn't execute until load() is called
     * async function fetchUser(id: string) {
     *   const data = await load({ id })
     *   console.log('User loaded:', data)
     * }
     * ```
     *
     * @group 4. Lifecycle
     */
    load: (
      variables?: TVariables,
    ) => Promise<MaybeMasked<TData> | undefined>
  }

  export namespace DocumentationTypes {
    /** @group Composables Namespaces */
    namespace useLazyQuery {
      /** {@inheritDoc @vue/apollo-composable!useLazyQuery.Options:type} */
      export interface Options extends Omit<useQuery.DocumentationTypes.useQuery.Options, 'enabled'> {}

      /** {@inheritDoc @vue/apollo-composable!useLazyQuery.Result:interface} */
      export interface Result extends useQuery.DocumentationTypes.useQuery.Result {
        /** {@inheritDoc @vue/apollo-composable!useLazyQuery.Result#load:member} */
        load: (variables?: OperationVariables) => Promise<object | undefined>
      }
    }

    /** {@inheritDoc @vue/apollo-composable!useLazyQuery:function(1)} */
    export function useLazyQuery(
      query: MaybeRefOrGetter<DocumentNode>,
      options?: MaybeRefOrGetter<useLazyQuery.Options>,
    ): useLazyQuery.Result
  }
}
// #endregion

// #region Implementation
/**
 * A composable for executing GraphQL queries lazily (on demand).
 *
 * Unlike `useQuery`, which executes immediately, `useLazyQuery` waits until
 * `load()` is called. This is useful for queries that should only run in
 * response to user actions (e.g., search, form submission).
 *
 * @param query - A GraphQL document.
 * @param options - Options to control how the query is executed.
 * @returns Query result object with reactive refs and `load` function.
 *
 * @group Composables
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useLazyQuery } from '@vue/apollo-composable'
 * import gql from 'graphql-tag'
 *
 * const SearchUsers = gql`query SearchUsers($term: String!) { users(search: $term) { id name } }`
 *
 * const { load, result, loading } = useLazyQuery(SearchUsers)
 *
 * async function search(term: string) {
 *   const data = await load({ term })
 *   console.log('Found users:', data?.users)
 * }
 * </script>
 *
 * <template>
 *   <input @keyup.enter="search($event.target.value)" />
 *   <div v-if="loading">Searching...</div>
 *   <ul v-else-if="result">
 *     <li v-for="user in result.users" :key="user.id">{{ user.name }}</li>
 *   </ul>
 * </template>
 * ```
 */
export function useLazyQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>,
  options?: MaybeRefOrGetter<useLazyQuery.Options<TData, TVariables>>,
): useLazyQuery.Result<TData, TVariables> {
  // Use the internal implementation with lazy=true
  const queryResult = useQueryImpl<TData, TVariables>(query, options as any, true)

  // Cast to mutable ref since we need to update variables
  const variablesRef = queryResult.variables as ShallowRef<TVariables>

  /**
   * Load the query with optional variables.
   * Variables are merged with composable-level variables.
   */
  async function load(variables?: TVariables): Promise<MaybeMasked<TData> | undefined> {
    // If variables are provided, merge with existing variables and re-assign
    if (variables != null) {
      variablesRef.value = { ...variablesRef.value, ...variables }
    }

    // Start the query
    queryResult.start()

    // Wait for the query to complete or error
    await until(() =>
      queryResult.current.value.resultState === 'complete'
      || queryResult.current.value.error != null,
    ).toBe(true, { timeout: 30000 })

    // If there's an error, throw it
    if (queryResult.error.value) {
      throw queryResult.error.value
    }

    return queryResult.result.value as MaybeMasked<TData>
  }

  return {
    ...queryResult,
    load,
  } as useLazyQuery.Result<TData, TVariables>
}
// #endregion
