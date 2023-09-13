import { DocumentNode } from 'graphql'
import { isRef } from 'vue-demi'
import { useQueryImpl, DocumentParameter, VariablesParameter, OptionsParameter, UseQueryOptions } from './useQuery'

export function useLazyQuery<
  TResult = any,
  TVariables extends Record<string, unknown> = any,
> (
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables>,
  options?: OptionsParameter<TResult, TVariables>,
) {
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
