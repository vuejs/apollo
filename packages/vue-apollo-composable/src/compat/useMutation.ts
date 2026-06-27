import type {
  ApolloClient,
  DocumentNode,
  ErrorLike,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import { computed, toValue } from '@vue/reactivity'
import { useApolloClient } from '../useApolloClient.ts'
import { useMutation as useMutationV5 } from '../useMutation.ts'

// #region Types

/**
 * v4-style `useMutation` options. Same surface as v4's `UseMutationOptions`.
 */
export type UseMutationOptions<
  TResult = any,
  TVariables = OperationVariables,
> = Omit<ApolloClient.MutateOptions<TResult, TVariables extends OperationVariables ? TVariables : OperationVariables>, 'mutation' | 'variables'> & {
  variables?: TVariables extends OperationVariables ? TVariables : OperationVariables
  clientId?: string
  throws?: 'auto' | 'always' | 'never'
}

export type MutateOverrideOptions<TResult> = Partial<Pick<
  UseMutationOptions<TResult, OperationVariables>,
  | 'update'
  | 'optimisticResponse'
  | 'context'
  | 'updateQueries'
  | 'refetchQueries'
  | 'awaitRefetchQueries'
  | 'errorPolicy'
  | 'fetchPolicy'
  | 'clientId'
>>

/**
 * v4-style mutation result. v5 already uses `data`/`error`/`extensions`, so this matches.
 */
export interface MutateResultV4<TResult> {
  data?: TResult | null | undefined
  error?: ErrorLike
  extensions?: Record<string, unknown>
}

export type MutateResult<TResult> = Promise<MutateResultV4<TResult> | null>

export type MutateFunction<TResult, TVariables> = (
  variables?: TVariables | null,
  overrideOptions?: MutateOverrideOptions<TResult>,
) => MutateResult<TResult>

type DocumentParameter<TResult, TVariables> = MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TResult, TVariables>>
type OptionsParameter<TResult, TVariables> = MaybeRefOrGetter<UseMutationOptions<TResult, TVariables>>

export interface OnDoneContext {
  client: ApolloClient
}

export interface OnErrorContext {
  client: ApolloClient
}

export interface UseMutationReturn<TResult, TVariables> {
  mutate: MutateFunction<TResult, TVariables>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<ErrorLike | null>>
  called: Readonly<Ref<boolean>>
  onDone: (fn: (result: MutateResultV4<TResult>, context: OnDoneContext) => void) => { off: () => void }
  onError: (fn: (error: ErrorLike, context: OnErrorContext) => void) => { off: () => void }
}

// #endregion

// #region Implementation

export function useMutation<
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  document: DocumentParameter<TResult, TVariables>,
  options: OptionsParameter<TResult, TVariables> = {} as OptionsParameter<TResult, TVariables>,
): UseMutationReturn<TResult, TVariables> {
  // v5's `useMutation` already accepts a `MaybeRefOrGetter` for options and has
  // a compatible composable-level surface. Pass document and options straight through.
  const v5 = useMutationV5<TResult, TVariables>(document, options as MaybeRefOrGetter<useMutationV5.Options<TResult, TVariables>>)

  const { resolveClient } = useApolloClient()
  function getClient() {
    const opts = toValue(options) as UseMutationOptions<TResult, TVariables> | undefined
    return resolveClient(opts?.clientId)
  }

  // v4 typed `error` as `Ref<X | null>`; v5 uses `undefined`. Map.
  const error = computed<ErrorLike | null>(() => v5.error.value ?? null)

  // v4 `mutate(variables, overrideOptions)` to v5 `mutate({ variables, ...overrideOptions })`.
  const mutate: MutateFunction<TResult, TVariables> = async (variables, overrideOptions) => {
    const result = await v5.mutate({
      ...(overrideOptions as object | undefined),
      ...(variables != null ? { variables } : {}),
    } as Parameters<typeof v5.mutate>[0])
    if (result.data === undefined && result.error != null) {
      return null
    }
    return result as MutateResultV4<TResult>
  }

  function onDone(fn: (result: MutateResultV4<TResult>, context: OnDoneContext) => void) {
    return v5.onDone((result) => {
      fn(result as MutateResultV4<TResult>, { client: getClient() })
    })
  }

  function onError(fn: (error: ErrorLike, context: OnErrorContext) => void) {
    return v5.onError((err) => {
      fn(err, { client: getClient() })
    })
  }

  return {
    mutate,
    loading: v5.loading,
    error,
    called: v5.called,
    onDone,
    onError,
  }
}

// #endregion
