import { DocumentNode } from 'graphql'
import { MutationOptions, OperationVariables } from 'apollo-client'
import { ref, onBeforeUnmount, isRef, Ref } from '@vue/composition-api'
import { FetchResult } from 'apollo-link'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { useEventHook } from './util/useEventHook'
import { trackMutation } from './util/loadingTracking'

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
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  options: UseMutationOptions<TResult, TVariables> | Ref<UseMutationOptions<TResult, TVariables>> | ReactiveFunction<UseMutationOptions<TResult, TVariables>> = null,
) {
  if (!options) options = {}

  const loading = ref<boolean>(false)
  trackMutation(loading)
  const error = ref<Error>(null)
  const called = ref<boolean>(false)

  const doneEvent = useEventHook<FetchResult<TResult, Record<string, any>, Record<string, any>>>()
  const errorEvent = useEventHook<Error>()

  // Apollo Client
  const { resolveClient } = useApolloClient()

  async function mutate (variables: TVariables = null, overrideOptions: Omit<UseMutationOptions, 'variables'> = {}) {
    let currentDocument: DocumentNode
    if (typeof document === 'function') {
      currentDocument = document()
    } else if (isRef(document)) {
      currentDocument = document.value
    } else {
      currentDocument = document
    }

    let currentOptions: UseMutationOptions<TResult, TVariables>
    if (typeof options === 'function') {
      currentOptions = options()
    } else if (isRef(options)) {
      currentOptions = options.value
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
        ...overrideOptions,
        variables: {
          ...variables || {},
          ...currentOptions.variables || {},
        },
      })
      loading.value = false
      doneEvent.trigger(result)
      return result
    } catch (e) {
      error.value = e
      loading.value = false
      errorEvent.trigger(e)
      throw e
    }
  }

  onBeforeUnmount(() => {
    loading.value = false
  })

  return {
    mutate,
    loading,
    error,
    called,
    onDone: doneEvent.on,
    onError: errorEvent.on,
  }
}
