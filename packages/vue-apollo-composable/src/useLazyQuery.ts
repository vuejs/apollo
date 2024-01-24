import { DocumentNode } from 'graphql'
import { isRef } from 'vue-demi'
import { useQueryImpl, DocumentParameter, VariablesParameter, OptionsParameter, UseQueryOptions, UseQueryReturn } from './useQuery'
import type { OperationVariables } from '@apollo/client/core'
import { isServer } from './util/env.js'

export interface UseLazyQueryReturn<TResult, TVariables extends OperationVariables> extends UseQueryReturn<TResult, TVariables> {
  /**
   * Activate the query and starts loading.
   * @param document Override document
   * @param variables Override variables
   * @param options Override options
   * @returns Returns false if the query is already active, otherwise the next result of the query.
   */
  load: (document?: DocumentNode | null, variables?: TVariables | null, options?: UseQueryOptions | null) => false | Promise<TResult>
}

export function useLazyQuery<
  TResult = any,
  TVariables extends Record<string, unknown> = any,
> (
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables>,
  options?: OptionsParameter<TResult, TVariables>,
): UseLazyQueryReturn<TResult, TVariables> {
  const query = useQueryImpl<TResult, TVariables>(document, variables, options, true)

  function load (
    document?: DocumentNode | null,
    variables?: TVariables | null,
    options?: UseQueryOptions | null,
  ) {
    if (document) {
      query.document.value = document
    }
    if (variables) {
      query.variables.value = variables
    }
    if (options) {
      Object.assign(isRef(query.options) ? query.options.value : query.options, options)
    }
    const isFirstRun = query.forceDisabled.value
    if (isFirstRun) {
      query.forceDisabled.value = false

      // If SSR, we need to start the query manually since `watch` on `isEnabled` in `useQueryImpl` won't be called.
      if (isServer) {
        query.start()
      }

      return new Promise<TResult>((resolve, reject) => {
        const { off: offResult } = query.onResult((result) => {
          if (!result.loading) {
            resolve(result.data)
            offResult()
            offError()
          }
        })
        const { off: offError } = query.onError((error) => {
          reject(error)
          offResult()
          offError()
        })
      })
    } else {
      return false
    }
  }

  return {
    ...query,
    load,
  }
}
