import { DocumentNode } from 'graphql'
import { MutationOptions, OperationVariables } from 'apollo-client'
import { ref } from '@vue/composition-api'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'

export interface UseMutationOptions<
  TResult = any,
  TVariables = OperationVariables
> extends Omit<MutationOptions<TResult, TVariables>, 'mutation'> {
  clientId?: string
}

export function useMutation<
  TResult = any,
  TVariables = OperationVariables
> (
  document: DocumentNode | ReactiveFunction<DocumentNode>,
  options: UseMutationOptions<TResult, TVariables> | ReactiveFunction<UseMutationOptions<TResult, TVariables>> = null,
) {
  if (!options) options = {}

  const loading = ref<boolean>(false)
  const error = ref<Error>(null)
  const called = ref<boolean>(false)

  // Apollo Client
  const { resolveClient } = useApolloClient()

  async function mutate (variables: TVariables = null) {
    let currentDocument: DocumentNode
    if (typeof document === 'function') {
      currentDocument = document()
    } else {
      currentDocument = document
    }

    let currentOptions: UseMutationOptions<TResult, TVariables>
    if (typeof options === 'function') {
      currentOptions = options()
    } else {
      currentOptions = options
    }
    const client = resolveClient(currentOptions.clientId)
    error.value = null
    loading.value = true
    called.value = true
    try {
      const result = await client.mutate({
        mutation: currentDocument,
        ...currentOptions,
        variables: {
          ...variables || {},
          ...currentOptions.variables || {},
        },
      })
      loading.value = false
      return result
    } catch (e) {
      error.value = e
      loading.value = false
      throw e
    }
  }

  return {
    mutate,
    loading,
    error,
    called,
  }
}