import type {
  ApolloClient,
  DocumentNode,
  ErrorLike,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import type { useSubscription as useSubscriptionV5 } from '../useSubscription.ts'
import { computed, toValue } from '@vue/reactivity'
import { useApolloClient } from '../useApolloClient.ts'
import { useSubscription as useSubscriptionV5Impl } from '../useSubscription.ts'

// #region Types

/**
 * v4-style `useSubscription` options. Also accepts variables in options so
 * native v5 call sites can move to the compat import during incremental migrations.
 */
export type UseSubscriptionOptions<
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
> = Omit<ApolloClient.SubscribeOptions<TResult, TVariables>, 'query' | 'variables'> & {
  variables?: VariablesParameter<TVariables>
  clientId?: string
  enabled?: boolean | Ref<boolean>
  throttle?: number
  debounce?: number
}

type DocumentParameter<TResult, TVariables> = MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TResult, TVariables>>
/**
 * Accepts either v4's whole-object form or v5's per-key reactive form.
 */
type VariablesParameter<TVariables extends OperationVariables>
  = | MaybeRefOrGetter<TVariables>
    | { [Key in keyof TVariables]: MaybeRefOrGetter<TVariables[Key]> }
type OptionsParameter<TResult, TVariables> = MaybeRefOrGetter<UseSubscriptionOptions<TResult, TVariables>>

/**
 * v4-style subscription result payload (`data` rather than v5's flatter `result.data`).
 */
export interface SubscriptionResultV4<TResult> {
  data?: TResult | null
  error?: ErrorLike
  extensions?: Record<string, unknown>
}

export interface OnResultContext {
  client: ApolloClient
}

export interface OnErrorContext {
  client: ApolloClient
}

export interface UseSubscriptionReturn<TResult, TVariables> {
  result: Readonly<Ref<TResult | undefined>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<ErrorLike | null>>
  start: () => void
  stop: () => void
  restart: () => void
  document: Readonly<Ref<DocumentNode>>
  variables: Readonly<Ref<TVariables>>
  options: Readonly<Ref<UseSubscriptionOptions<TResult, TVariables> | undefined>>
  onResult: (fn: (result: SubscriptionResultV4<TResult>, context: OnResultContext) => void) => { off: () => void }
  onError: (fn: (error: ErrorLike, context: OnErrorContext) => void) => { off: () => void }
}

// #endregion

// #region Overloads

export function useSubscription<TResult = any>(
  document: DocumentParameter<TResult, undefined>,
): UseSubscriptionReturn<TResult, undefined>

export function useSubscription<TResult = any>(
  document: DocumentParameter<TResult, undefined>,
  variables: undefined | null,
  options: OptionsParameter<TResult, null>,
): UseSubscriptionReturn<TResult, null>

export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>,
): UseSubscriptionReturn<TResult, TVariables>

export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentParameter<TResult, TVariables>,
): UseSubscriptionReturn<TResult, TVariables>

export function useSubscription<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>,
  options: OptionsParameter<TResult, TVariables>,
): UseSubscriptionReturn<TResult, TVariables>

// #endregion

// #region Implementation

export function useSubscription<
  TResult,
  TVariables extends OperationVariables,
>(
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables> | undefined | null,
  options?: OptionsParameter<TResult, TVariables>,
): UseSubscriptionReturn<TResult, TVariables> {
  // Fold the positional `variables` into v5's options shape.
  const mergedOptions = computed(() => {
    const opts = (toValue(options) ?? {}) as UseSubscriptionOptions<TResult, TVariables>
    const vars = toValue(variables ?? undefined)
    return {
      ...opts,
      ...(vars != null ? { variables: vars } : {}),
    } as unknown as useSubscriptionV5.Options<TResult, TVariables>
  })

  const v5 = useSubscriptionV5Impl<TResult, TVariables>(document, mergedOptions)

  const { resolveClient } = useApolloClient()
  function getClient() {
    const opts = toValue(options) as UseSubscriptionOptions<TResult, TVariables> | undefined
    return resolveClient(opts?.clientId)
  }

  const error = computed<ErrorLike | null>(() => v5.error.value ?? null)

  // v4 `onResult` received a `FetchResult` (`{ data, errors, extensions }`).
  // v5 fires with just the data. Wrap to match v4's shape.
  function onResult(fn: (result: SubscriptionResultV4<TResult>, context: OnResultContext) => void) {
    return v5.onResult(((data: TResult) => {
      fn({ data }, { client: getClient() })
    }) as Parameters<typeof v5.onResult>[0])
  }

  function onError(fn: (error: ErrorLike, context: OnErrorContext) => void) {
    return v5.onError((err) => {
      fn(err, { client: getClient() })
    })
  }

  function restart() {
    void v5.restart()
  }

  return {
    result: v5.result,
    loading: v5.loading,
    error,
    start: v5.start,
    stop: v5.stop,
    restart,
    document: v5.document,
    variables: v5.variables,
    options: v5.options as Readonly<Ref<UseSubscriptionOptions<TResult, TVariables> | undefined>>,
    onResult,
    onError,
  }
}

// #endregion
