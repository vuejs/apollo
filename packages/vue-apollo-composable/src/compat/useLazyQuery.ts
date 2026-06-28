import type { DocumentNode, OperationVariables } from '@apollo/client'
import type { Ref, ShallowRef } from '@vue/reactivity'
import type {
  DocumentParameter,
  OptionsParameter,
  UseQueryReturn,
  VariablesParameter,
} from './useQuery.ts'
import { buildCompatQuery } from './useQuery.ts'

// #region Types

export interface UseLazyQueryReturn<
  TResult,
  TVariables extends OperationVariables,
> extends UseQueryReturn<TResult, TVariables> {
  /**
   * Activate the query and start loading. Matches v4's signature minus the
   * options override, which has no reliable mapping in v5 (options are wrapped
   * in a computed with no setter).
   *
   * On the first call, starts the query and returns a Promise that resolves
   * with the query result data once complete (or rejects on error).
   *
   * On subsequent calls, returns `false` without re-running. This matches v4's
   * behavior. To re-run with new variables, mutate your reactive variables
   * ref/getter, or call `refetch(variables)`.
   *
   * @param document - Optional document override. Applied via direct ref
   *   mutation, so it only takes effect if the original `document` argument
   *   to `useLazyQuery` was a plain value or a writable ref.
   * @param variables - Optional variables override. Replaces the current
   *   variables (matches v4 semantics; v5's `useLazyQuery.load` merges).
   */
  load: (
    document?: DocumentNode | null,
    variables?: TVariables | null,
  ) => false | Promise<TResult | undefined>
}

// #endregion

// #region Implementation

export function useLazyQuery<
  TResult = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  document: DocumentParameter<TResult, TVariables>,
  variables?: VariablesParameter<TVariables>,
  options?: OptionsParameter<TResult, TVariables>,
): UseLazyQueryReturn<TResult, TVariables> {
  const query = buildCompatQuery<TResult, TVariables>(document, variables, options, true)

  // The document and variables refs returned by useQueryImpl are writable when
  // the caller supplied a plain value or a writable Ref. If they passed a
  // getter, the underlying ref is read-only and Vue will warn on assignment.
  const documentRef = query.document as Ref<DocumentNode>
  const variablesRef = query.variables as ShallowRef<TVariables>

  let isLoaded = false

  function load(
    doc?: DocumentNode | null,
    vars?: TVariables | null,
  ): false | Promise<TResult | undefined> {
    if (doc != null) {
      documentRef.value = doc
    }
    if (vars != null) {
      // v4 replaces rather than merges
      variablesRef.value = vars
    }

    if (isLoaded) {
      return false
    }
    isLoaded = true

    // Wait for the next state change carrying data or an error. Attach the
    // listeners before calling start() so we never miss the first emission;
    // intermediate loading states are ignored.
    return new Promise<TResult | undefined>((resolve, reject) => {
      let settled = false
      let offResult = () => {}
      let offError = () => {}

      function cleanup() {
        offResult()
        offError()
      }

      offResult = query.onResult((result) => {
        if (settled || result.loading)
          return
        settled = true
        cleanup()
        resolve(result.data)
      }).off

      offError = query.onError((err) => {
        if (settled)
          return
        const errorPolicy = query.options.value?.errorPolicy
        if (errorPolicy === 'all' || errorPolicy === 'ignore') {
          // v5 emits `onError` from the state handler before compat's
          // `onResult` listener receives that same non-loading state. v4's
          // `load()` resolved from `onResult` first for these error policies.
          queueMicrotask(() => {
            if (settled)
              return
            settled = true
            cleanup()
            reject(err)
          })
          return
        }
        settled = true
        cleanup()
        reject(err)
      }).off

      query.start()
    })
  }

  return {
    ...query,
    load,
  }
}

// #endregion
