import { DocumentNode } from 'graphql'
import { MutationOptions, OperationVariables, FetchResult, TypedDocumentNode, ApolloError } from '@apollo/client/core/index.js'
import { ref, onBeforeUnmount, isRef, Ref, getCurrentInstance } from 'vue-demi'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { useEventHook } from './util/useEventHook'
import { trackMutation } from './util/loadingTracking'
import { toApolloError } from './util/toApolloError'

/**
 * `useMutation` options for mutations that don't require `variables`.
 */
export interface UseMutationOptions<
  TResult = any,
  TVariables = OperationVariables
> extends Omit<MutationOptions<TResult, TVariables>, 'mutation'> {
  clientId?: string
  throws?: 'auto' | 'always' | 'never'
}

type DocumentParameter<TResult, TVariables> = DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode> | TypedDocumentNode<TResult, TVariables> | Ref<TypedDocumentNode<TResult, TVariables>> | ReactiveFunction<TypedDocumentNode<TResult, TVariables>>
type OptionsParameter<TResult, TVariables> = UseMutationOptions<TResult, TVariables> | Ref<UseMutationOptions<TResult, TVariables>> | ReactiveFunction<UseMutationOptions<TResult, TVariables>>

export type MutateOverrideOptions<TResult> = Pick<UseMutationOptions<TResult, OperationVariables>, 'update' | 'optimisticResponse' | 'context' | 'updateQueries' | 'refetchQueries' | 'awaitRefetchQueries' | 'errorPolicy' | 'fetchPolicy' | 'clientId'>
export type MutateResult<TResult> = Promise<FetchResult<TResult, Record<string, any>, Record<string, any>> | null>
export type MutateFunction<TResult, TVariables> = (variables?: TVariables | null, overrideOptions?: MutateOverrideOptions<TResult>) => MutateResult<TResult>

export interface UseMutationReturn<TResult, TVariables> {
  mutate: MutateFunction<TResult, TVariables>
  loading: Ref<boolean>
  error: Ref<ApolloError | null>
  called: Ref<boolean>
  onDone: (fn: (param: FetchResult<TResult, Record<string, any>, Record<string, any>>) => void) => {
    off: () => void
  }
  onError: (fn: (param: ApolloError) => void) => {
    off: () => void
  }
}

export function useMutation<
  TResult = any,
  TVariables extends OperationVariables = OperationVariables
> (
  document: DocumentParameter<TResult, TVariables>,
  options: OptionsParameter<TResult, TVariables> = {},
): UseMutationReturn<TResult, TVariables> {
  const vm = getCurrentInstance()
  const loading = ref<boolean>(false)
  vm && trackMutation(loading)
  const error = ref<ApolloError | null>(null)
  const called = ref<boolean>(false)

  const doneEvent = useEventHook<FetchResult<TResult, Record<string, any>, Record<string, any>>>()
  const errorEvent = useEventHook<ApolloError>()

  // Apollo Client
  const { resolveClient } = useApolloClient()

  async function mutate (variables?: TVariables | null, overrideOptions: Omit<UseMutationOptions<TResult, TVariables>, 'variables'> = {}) {
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
      const result = await client.mutate<TResult, TVariables>({
        mutation: currentDocument,
        ...currentOptions,
        ...overrideOptions,
        variables: (variables ?? currentOptions.variables)
          ? {
            ...(currentOptions.variables as TVariables),
            ...(variables as TVariables),
          }
          : undefined,
      })
      loading.value = false
      doneEvent.trigger(result)
      return result
    } catch (e) {
      const apolloError = toApolloError(e)
      error.value = apolloError
      loading.value = false
      errorEvent.trigger(apolloError)
      if (currentOptions.throws === 'always' || (currentOptions.throws !== 'never' && !errorEvent.getCount())) {
        throw apolloError
      }
    }
    return null
  }

  vm && onBeforeUnmount(() => {
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
