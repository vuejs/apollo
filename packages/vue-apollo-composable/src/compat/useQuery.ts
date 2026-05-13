import type {
  ApolloClient,
  DocumentNode,
  ErrorLike,
  ObservableQuery,
  OperationVariables,
  TypedDocumentNode,
  UpdateQueryMapFn,
} from '@apollo/client'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import type { useQuery as useQueryV5 } from '../useQuery.ts'
import { computed, toValue } from '@vue/reactivity'
import { useApolloClient } from '../useApolloClient.ts'
import { useQueryImpl } from '../useQuery.ts'

// #region Types

/**
 * v4-style `useQuery` options. Adds Vue-Apollo-specific flags to
 * `ApolloClient.WatchQueryOptions`. Identical surface to v4's `UseQueryOptions`.
 */
export type UseQueryOptions<
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
> = Omit<ApolloClient.WatchQueryOptions<TResult, TVariables>, 'query' | 'variables'> & {
  clientId?: string
  enabled?: boolean | Ref<boolean>
  throttle?: number
  debounce?: number
  prefetch?: boolean
  keepPreviousResult?: boolean
}

export type DocumentParameter<TResult, TVariables> = MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TResult, TVariables> | null | undefined>
/**
 * Accepts either v4's whole-object form (a value, ref, or getter for the full
 * variables object) or v5's per-key reactive form (an object whose values are
 * each refs/getters/plain).
 */
export type VariablesParameter<TVariables extends OperationVariables>
  = | MaybeRefOrGetter<TVariables>
    | { [Key in keyof TVariables]: MaybeRefOrGetter<TVariables[Key]> }
export type OptionsParameter<TResult, TVariables extends OperationVariables> = MaybeRefOrGetter<UseQueryOptions<TResult, TVariables>>

export interface OnResultContext {
  client: ApolloClient
}

export interface OnErrorContext {
  client: ApolloClient
}

/**
 * v4-style `ApolloQueryResult` shape (`data` instead of v5's `result`).
 */
export interface ApolloQueryResultV4<TResult> {
  data: TResult | undefined
  loading: boolean
  networkStatus: number
  error?: ErrorLike | undefined
  partial?: boolean | undefined
}

export interface UseQueryReturn<TResult, TVariables extends OperationVariables> {
  result: Readonly<Ref<TResult | undefined>>
  loading: Readonly<Ref<boolean>>
  networkStatus: Readonly<Ref<number | undefined>>
  error: Readonly<Ref<ErrorLike | null>>
  start: () => void
  stop: () => void
  restart: () => void
  document: Readonly<Ref<DocumentNode>>
  variables: Readonly<Ref<TVariables>>
  options: Readonly<Ref<UseQueryOptions<TResult, TVariables> | undefined>>
  query: Readonly<Ref<ObservableQuery<TResult, TVariables> | undefined>>
  refetch: (variables?: TVariables) => Promise<(ApolloQueryResultV4<TResult> & Record<string, unknown>) | undefined>
  fetchMore: useQueryV5.Base.Result<TResult, TVariables>['fetchMore']
  updateQuery: (mapFn: UpdateQueryMapFn<TResult, TVariables>) => void
  subscribeToMore: useQueryV5.Base.Result<TResult, TVariables>['subscribeToMore']
  onResult: (fn: (result: ApolloQueryResultV4<TResult>, context: OnResultContext) => void) => { off: () => void }
  onError: (fn: (error: ErrorLike, context: OnErrorContext) => void) => { off: () => void }
}

// #endregion

// #region Overloads

export function useQuery<TResult = any>(
  document: DocumentParameter<TResult, undefined>,
): UseQueryReturn<TResult, Record<string, never>>

export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentParameter<TResult, TVariables>,
): UseQueryReturn<TResult, TVariables>

export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables>,
): UseQueryReturn<TResult, TVariables>

export function useQuery<TResult = any>(
  document: DocumentParameter<TResult, undefined>,
  variables: undefined | null,
  options: OptionsParameter<TResult, Record<string, never>>,
): UseQueryReturn<TResult, Record<string, never>>

export function useQuery<TResult = any, TVariables extends OperationVariables = OperationVariables>(
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables> | undefined | null,
  options: OptionsParameter<TResult, TVariables>,
): UseQueryReturn<TResult, TVariables>

// #endregion

// #region Implementation

export function useQuery<
  TResult,
  TVariables extends OperationVariables,
>(
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables> | undefined | null,
  options?: OptionsParameter<TResult, TVariables>,
): UseQueryReturn<TResult, TVariables> {
  return buildCompatQuery(document, variables, options, false)
}

/**
 * Shared between `useQuery` and `useLazyQuery` so the v4 shape mapping lives in one place.
 *
 * @internal
 */
export function buildCompatQuery<
  TResult,
  TVariables extends OperationVariables,
>(
  document: DocumentParameter<TResult, TVariables>,
  variables: VariablesParameter<TVariables> | undefined | null,
  options: OptionsParameter<TResult, TVariables> | undefined,
  lazy: boolean,
): UseQueryReturn<TResult, TVariables> {
  // Build a merged options getter that folds the positional `variables` into v5's options shape.
  const mergedOptions = computed(() => {
    const opts = (toValue(options) ?? {}) as UseQueryOptions<TResult, TVariables>
    const vars = toValue(variables ?? undefined)
    return {
      ...opts,
      ...(vars != null ? { variables: vars } : {}),
    } as unknown as useQueryV5.Options<TResult, TVariables>
  })

  const v5 = useQueryImpl<TResult, TVariables>(document as any, mergedOptions, lazy)

  // Resolve client lazily (matches v5's behavior: clientId may change over time)
  const { resolveClient } = useApolloClient()
  function getClient() {
    return resolveClient((toValue(options) as UseQueryOptions<TResult, TVariables> | undefined)?.clientId)
  }

  // v4 `error` was `Ref<X | null>`; v5 uses `undefined`. Map for back-compat.
  const error = computed<ErrorLike | null>(() => v5.error.value ?? null)

  // v4 `networkStatus` was optional; v5 always returns a value.
  const networkStatus = computed<number | undefined>(() => v5.networkStatus.value)

  // v4 `onResult` fired with the full `ApolloQueryResult` shape, not just data.
  // Map from v5's `onNextState` (which fires on every state change) so we keep v4's timing.
  function onResult(fn: (result: ApolloQueryResultV4<TResult>, context: OnResultContext) => void) {
    return v5.onNextState((state) => {
      fn(currentToApolloQueryResult(state), { client: getClient() })
    })
  }

  function onError(fn: (error: ErrorLike, context: OnErrorContext) => void) {
    return v5.onError((err) => {
      fn(err, { client: getClient() })
    })
  }

  // v4 refetch returned `{ data, ...rest }`; v5 returns `{ result, ...rest }`. Rename back.
  async function refetch(vars?: TVariables) {
    const res = await v5.refetch(vars)
    if (res == null)
      return undefined
    const { result, ...rest } = res
    return {
      data: result,
      ...rest,
    } as ApolloQueryResultV4<TResult> & Record<string, unknown>
  }

  // v4 restart was sync void; v5 returns a Promise. Discard the promise to match v4 typing.
  function restart() {
    void v5.restart()
  }

  return {
    result: v5.result as Readonly<Ref<TResult | undefined>>,
    loading: v5.loading,
    networkStatus,
    error,
    start: v5.start,
    stop: v5.stop,
    restart,
    document: v5.document,
    variables: v5.variables,
    options: v5.options as unknown as Readonly<Ref<UseQueryOptions<TResult, TVariables> | undefined>>,
    query: v5.query,
    refetch,
    fetchMore: v5.fetchMore,
    updateQuery: v5.updateQuery,
    subscribeToMore: v5.subscribeToMore,
    onResult,
    onError,
  }
}

/**
 * Convert v5's `Current` state to v4's `ApolloQueryResult` shape (rename `result` to `data`).
 */
function currentToApolloQueryResult<TResult>(state: useQueryV5.Current<TResult>): ApolloQueryResultV4<TResult> {
  return {
    data: state.result as TResult | undefined,
    loading: state.loading,
    networkStatus: state.networkStatus,
    error: state.error,
    partial: state.resultState === 'partial' ? true : undefined,
  }
}

// #endregion
