import { DocumentNode } from 'graphql'
import { isRef } from 'vue-demi'
import { useQueryImpl, DocumentParameter, VariablesParameter, OptionsParameter, UseQueryOptions } from './useQuery'

export function useLazyQuery<
  TResult = any,
  TVariables = any,
> (
  document: DocumentParameter,
  variables?: VariablesParameter<TVariables>,
  options?: OptionsParameter<TResult, TVariables>,
) {
  const query = useQueryImpl<TResult, TVariables>(document, variables, options, true)

  function load (
    document?: DocumentNode,
    variables?: TVariables,
    options?: UseQueryOptions,
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
    query.forceDisabled.value = false
  }

  return {
    ...query,
    load,
  }
}
