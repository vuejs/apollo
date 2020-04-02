import { DocumentNode } from 'graphql'
import { MutationOptions, OperationVariables } from 'apollo-client'
import { ref, onBeforeUnmount, isRef, Ref } from '@vue/composition-api'
import { FetchResult } from 'apollo-link'
import { useApolloClient } from './useApolloClient'
import { ReactiveFunction } from './util/ReactiveFunction'
import { useEventHook } from './util/useEventHook'
import { trackMutation } from './util/loadingTracking'

/**
 * `useMutation` options for mutations that don't require `variables`.
 */
export interface UseMutationOptions<
  TResult = any,
  TVariables = OperationVariables
> extends Omit<MutationOptions<TResult, TVariables>, 'mutation'> {
  clientId?: string
}

/**
 * `useMutation` options for mutations that don't use variables.
 */
export type UseMutationOptionsNoVariables<
  TResult = any,
  TVariables = OperationVariables
> = Omit<UseMutationOptions<TResult, TVariables>, 'variables'>

/**
 * `useMutation` options for mutations require variables.
 */
export interface UseMutationOptionsWithVariables<
  TResult = any,
  TVariables = OperationVariables
> extends UseMutationOptions<TResult, TVariables> {
  variables: TVariables
}

type MutateOverrideOptions = Pick<UseMutationOptions<any, OperationVariables>, 'update' | 'optimisticResponse' | 'context' | 'updateQueries' | 'refetchQueries' | 'awaitRefetchQueries' | 'errorPolicy' | 'fetchPolicy' | 'clientId'>
type MutateResult<TResult> = Promise<FetchResult<TResult, Record<string, any>, Record<string, any>>>
export type MutateWithOptionalVariables<TResult, TVariables> = (variables?: TVariables, overrideOptions?: MutateOverrideOptions) => MutateResult<TResult>
export type MutateWithRequiredVariables<TResult, TVariables> = (variables: TVariables, overrideOptions?: MutateOverrideOptions) => MutateResult<TResult>

export interface UseMutationReturn<TResult, TVariables, Mutate extends MutateWithOptionalVariables<TResult, TVariables> = MutateWithOptionalVariables<TResult, TVariables>> {
  mutate: Mutate
  loading: Ref<boolean>
  error: Ref<Error>
  called: Ref<boolean>
  onDone: (fn: (param?: FetchResult<TResult, Record<string, any>, Record<string, any>>) => void) => {
      off: () => void
  };
  onError: (fn: (param?: Error) => void) => {
      off: () => void
  };
};

/**
 * Use a mutation with variables.
 */
export function useMutation<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | ReactiveFunction<DocumentNode>,
  options?: UseMutationOptionsWithVariables<TResult, TVariables> | ReactiveFunction<UseMutationOptionsWithVariables<TResult, TVariables>>
): UseMutationReturn<TResult, TVariables>

/**
 * Use a mutation with variables, but without a default.
 */
export function useMutation<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentNode | ReactiveFunction<DocumentNode>,
  options?: UseMutationOptionsNoVariables<TResult, undefined> | ReactiveFunction<UseMutationOptionsNoVariables<TResult, undefined>>
): UseMutationReturn<TResult, TVariables, MutateWithRequiredVariables<TResult, TVariables>>

export function useMutation<
  TResult,
  TVariables extends OperationVariables
> (
  document: DocumentNode | Ref<DocumentNode> | ReactiveFunction<DocumentNode>,
  options?: UseMutationOptions<TResult, TVariables> | Ref<UseMutationOptions<TResult, TVariables>> | ReactiveFunction<UseMutationOptions<TResult, TVariables>>,
): UseMutationReturn<TResult, TVariables> {
  if (!options) options = {}

  const loading = ref<boolean>(false)
  trackMutation(loading)
  const error = ref<Error>(null)
  const called = ref<boolean>(false)

  const doneEvent = useEventHook<FetchResult<TResult, Record<string, any>, Record<string, any>>>()
  const errorEvent = useEventHook<Error>()

  // Apollo Client
  const { resolveClient } = useApolloClient()

  async function mutate (variables?: TVariables, overrideOptions: Omit<UseMutationOptions<TResult, TVariables>, 'variables'> = {}) {
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
      const result = await client.mutate<TResult>({
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
