import type {
  ApolloClient,
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client'
import type { ApolloCache, MissingTree, Reference, StoreObject } from '@apollo/client/cache'
import type { FragmentType } from '@apollo/client/masking'
import type { MaybeRefOrGetter, Ref } from '@vue/reactivity'
import type { EventHookOn } from '@vueuse/core'
import type { Subscription } from 'rxjs'
import type { RenameKey } from './util/types.ts'
import { computed, onScopeDispose, shallowRef, toRef, toValue } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'
import { createEventHook } from '@vueuse/core'
import { useApolloClient } from './useApolloClient.ts'

// #region Types
export declare namespace useFragment {
  // Self-import to avoid shadowing in nested namespaces
  import _self = useFragment

  /**
   * Type for the `variables` option parameter: either a ref/getter of the full variables object,
   * or an object mapping individual variable names to refs/getters.
   *
   * @example
   * ```ts
   * // Single ref/getter for all variables
   * const variables = reactive({ id: 1 })
   * useFragment({ fragment, from, variables })
   *
   * // Object mapping individual variable names to refs/getters
   * const id = ref(1)
   * useFragment({ fragment, from, variables: { id } })
   *
   * // With props or any reactive values
   * const { id } = defineProps<{ id: number }>()
   * useFragment({ fragment, from, variables: () => ({ id }) })
   * ```
   */
  export type ReactiveVariablesParameter<TVariables extends OperationVariables>
    = | MaybeRefOrGetter<TVariables>
      | { [Key in keyof TVariables]: MaybeRefOrGetter<TVariables[Key]> }

  /** Makes `variables` required only when TVariables has required properties. */
  export type ReactiveVariablesOption<TVariables extends OperationVariables> = {} extends TVariables ? {
    variables?: ReactiveVariablesParameter<TVariables>
  } : {
    variables: ReactiveVariablesParameter<TVariables>
  }

  /** Cache identifier: object with `__typename`/`id`, `{ __ref }` reference, or string ID. */
  export type FromValue<TData>
    = | StoreObject
      | Reference
      | FragmentType<TData>
      | string
      | null

  export namespace Base {
    /** Base options for useFragment. */
    export interface Options<
      TData = unknown,
      TVariables extends OperationVariables = OperationVariables,
    > {
      /**
       * A GraphQL fragment document.
       *
       * @group 1. Fragment
       */
      fragment: MaybeRefOrGetter<DocumentNode | TypedDocumentNode<TData, TVariables>>

      /**
       * Name of the fragment to use if document contains multiple fragments.
       *
       * @group 1. Fragment
       */
      fragmentName?: MaybeRefOrGetter<string>

      /**
       * Cache identifiable entity to read the fragment from.
       *
       * @group 2. Data Source
       */
      from: MaybeRefOrGetter<FromValue<TData> | Array<FromValue<TData>>>

      /**
       * Read from optimistic cache data.
       *
       * @defaultValue true
       * @group 3. Configuration
       */
      optimistic?: boolean

      /**
       * ID of a named Apollo client to use.
       *
       * @group 3. Configuration
       */
      clientId?: string
    }
  }

  /** Options for useFragment. */
  export type Options<
    TData = unknown,
    TVariables extends OperationVariables = OperationVariables,
  > = Base.Options<TData, TVariables> & ReactiveVariablesOption<TVariables>

  export namespace Base {
    /** Result returned by useFragment. */
    export interface Result<TData = unknown> {
      /**
       * Current state as a discriminated union type.
       *
       * @group 1. Operation data
       */
      current: Readonly<Ref<_self.Current<TData>>>

      /**
       * An object containing the result of your GraphQL fragment lookup after it completes.
       *
       * @group 1. Operation data
       */
      result: Readonly<Ref<_self.Current<TData>['result']>>

      /**
       * Describes the completeness of `result`.
       *
       * - `partial`: Some data could be fulfilled from the cache but `result` is
       *   incomplete. This is only possible when `returnPartialData` is `true`.
       *
       * - `complete`: `result` is a fully satisfied query result fulfilled
       *   either from the cache or network.
       *
       * @group 1. Operation data
       */
      resultState: Readonly<Ref<_self.Current<TData>['resultState']>>

      /**
       * Whether the fragment data is complete.
       *
       * @group 1. Operation data
       */
      complete: Readonly<Ref<boolean>>

      /**
       * Tree of missing field errors when `complete` is false.
       *
       * @group 1. Operation data
       */
      missing: Readonly<Ref<MissingTree>>

      /**
       * Event triggered when fragment data changes.
       *
       * @group 2. Events
       */
      onNextState: EventHookOn<_self.Current<TData>>
    }
  }

  export type Current<TData> = RenameKey<
    RenameKey<
      ApolloClient.WatchFragmentResult<TData>,
      'dataState',
      'resultState'
    >,
    'data',
    'result'
  >

  /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#result:member} */
  export interface Result<TData = unknown> extends Base.Result<TData> {}

  export namespace DocumentationTypes {
    /** @group Composables Namespaces */
    namespace useFragment {
      /** {@inheritDoc @vue/apollo-composable!useFragment.ReactiveVariablesParameter:type} */
      export type ReactiveVariablesParameter
        = | MaybeRefOrGetter<OperationVariables>
          | Record<string, MaybeRefOrGetter<any>>

      /** {@inheritDoc @vue/apollo-composable!useFragment.FromValue:type} */
      export type FromValue = object | string | null

      /** Current state */
      export interface Current {
        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#complete:member} */
        complete: boolean

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#result:member} */
        result: object | Array<object>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#resultState:member} */
        resultState: 'complete' | 'partial'

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#missing:member} */
        missing?: MissingTree
      }

      /** {@inheritDoc @vue/apollo-composable!useFragment.Options:type} */
      export interface Options extends Omit<_self.Base.Options<unknown>, 'from'> {
        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Options#fragment:member} */
        fragment: MaybeRefOrGetter<DocumentNode>

        /**
         * Variables for the fragment.
         * @group 1. Fragment
         */
        variables?: MaybeRefOrGetter<ReactiveVariablesParameter>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Options#from:member} */
        from: MaybeRefOrGetter<FromValue | Array<FromValue>>
      }
      /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result:interface} */
      export interface Result extends Omit<_self.Base.Result, 'current' | 'onNextState'> {
        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#complete:member} */
        complete: Ref<boolean>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#current:member} */
        current: Ref<Current>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#missing:member} */
        missing: Ref<MissingTree>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#onNextState:member} */
        onNextState: EventHookOn<Current>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#result:member} */
        result: Ref<object | Array<object>>

        /** {@inheritDoc @vue/apollo-composable!useFragment.Base.Result#resultState:member} */
        resultState: Ref<'complete' | 'partial'>
      }
    }

    /** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} */
    export function useFragment(
      options: useFragment.Options,
    ): useFragment.Result
  }
}
// #endregion

// #region Helpers
/**
 * Converts Apollo's WatchFragmentResult to Current format (renames data→result, dataState→resultState)
 */
function toCurrent<TData>(
  watchResult: ApolloClient.WatchFragmentResult<TData | TData[]>,
): useFragment.Current<TData | TData[]>
function toCurrent(
  watchResult: undefined,
): undefined
function toCurrent<TData>(
  watchResult: ApolloClient.WatchFragmentResult<TData | TData[]> | undefined,
): useFragment.Current<TData | TData[]> | undefined
function toCurrent<TData>(
  watchResult: ApolloClient.WatchFragmentResult<TData | TData[]> | undefined,
): useFragment.Current<TData | TData[]> | undefined {
  if (watchResult == null) {
    return undefined
  }

  const { data, dataState, ...rest } = watchResult
  // Due to complex discriminated union types, we need to cast here
  return { result: data, resultState: dataState, ...rest } as unknown as useFragment.Current<TData | TData[]>
}

/**
 * Resolves a single `from` value to a cache ID.
 */
function resolveFromToId<TData>(
  from: useFragment.FromValue<TData>,
  cache: ApolloCache,
): string | null {
  if (from == null)
    return null
  if (typeof from === 'string')
    return from

  return cache.identify(from) ?? null
}

// Apollo client doesn't support nullish result, to be consistent we use the same "empty object" result as null case
const nullResult = Object.freeze({
  result: {},
  resultState: 'partial',
  complete: false,
}) as useFragment.Current<any>

const nullArrayResult = Object.freeze({
  result: [],
  resultState: 'partial',
  complete: false,
}) as useFragment.Current<any>
// #endregion

// #region Implementation
export function useFragmentImpl<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  sourceOptions: MaybeRefOrGetter<useFragment.Options<TData, TVariables>>,
): useFragment.Result<TData> | useFragment.Result<TData[]> {
  // #region Input Normalization
  const options = toRef(sourceOptions) as Ref<useFragment.Options<TData, TVariables>>
  // #endregion

  // #region Apollo Client
  const { resolveClient } = useApolloClient()

  function getClient() {
    return resolveClient(options.value?.clientId)
  }
  // #endregion

  // #region Options Parsing
  const from = computed(() => toValue(options.value.from))
  const fragment = computed(() => toValue(options.value.fragment))
  const fragmentName = computed(() => toValue(options.value.fragmentName))

  /**
   * Resolves variables from either a single ref/getter or an object of individual refs.
   */
  const variables = computed(() => {
    const vars = toValue(options.value?.variables)
    if (vars == null)
      return undefined

    const result = {} as Record<string, unknown>
    for (const [key, value] of Object.entries(vars)) {
      result[key] = toValue(value)
    }
    return result as TVariables
  })
  // #endregion

  // #region Cache ID Resolution
  /**
   * Resolve cache IDs from the `from` option.
   * Like React's version: handles both single and array cases uniformly.
   */
  const cacheIds = computed(() => {
    const { cache } = getClient()
    const fromValue = from.value

    return Array.isArray(fromValue)
      ? fromValue.map(item => resolveFromToId(item, cache))
      : resolveFromToId(fromValue, cache)
  })
  // #endregion

  // #region Watch Options
  /**
   * Stable options for watchFragment - only changes when relevant options change.
   */
  const watchFragmentOptions = computed<ApolloCache.WatchFragmentOptions<TData, TVariables>>(() => ({
    fragment: fragment.value,
    from: cacheIds.value, // Apollo handles both single ID and array of IDs
    optimistic: options.value.optimistic ?? true,
    ...(fragmentName.value != null && { fragmentName: fragmentName.value }),
    ...(variables.value != null && { variables: variables.value }),
  }))
  // #endregion

  // #region Core State
  const observable = computed(() =>
    from.value == null
      ? undefined
      : getClient().watchFragment<TData, TVariables>(watchFragmentOptions.value) as ApolloClient.ObservableFragment<TData | TData[]>,
  )

  const initialResult = observable.value?.getCurrentResult() as ApolloClient.WatchFragmentResult<TData | TData[]> | undefined
  const subscription = shallowRef<Subscription>()
  const currentState = shallowRef(toCurrent(initialResult) ?? (Array.isArray(from.value) ? nullArrayResult : nullResult))

  // #endregion

  // #region Events
  const nextStateEvent = createEventHook<unknown>()

  nextStateEvent.on(((newState: useFragment.Current<TData | TData[]> | undefined) => {
    currentState.value = newState
  }) as any) // Casting to any to work around complex type issues
  // #endregion

  // #region Observable
  /**
   * Handle observable changes - cleanup old subscription, setup new one.
   */
  watch(observable, (newObservable) => {
    // Cleanup old subscription
    subscription.value?.unsubscribe()
    subscription.value = undefined

    if (newObservable) {
      // Get initial result synchronously
      const initialResult = newObservable.getCurrentResult?.()
      if (initialResult) {
        currentState.value = toCurrent(initialResult)
      }

      // Subscribe to updates
      subscription.value = newObservable.subscribe({
        next: (watchResult) => {
          nextStateEvent.trigger(toCurrent(watchResult))
        },
      })
    }
  })
  // #endregion

  // #region Cleanup
  onScopeDispose(() => {
    subscription.value?.unsubscribe()
  })
  // #endregion

  // #region Public API
  const result = computed(() => currentState.value?.result)
  const resultState = computed(() => currentState.value?.resultState)
  const complete = computed(() => currentState.value?.complete ?? false)
  const missing = computed(() =>
    currentState.value && 'missing' in currentState.value
      ? currentState.value.missing
      : undefined,
  )

  return {
    current: currentState as Readonly<Ref<useFragment.Current<TData>>>,
    result,
    resultState,
    complete,
    missing,

    onNextState: nextStateEvent.on as unknown as EventHookOn<useFragment.Current<TData>>,
  }
  // #endregion
}
// #endregion

// #region useFragment Overloads
/**
 * A composable for reading fragment data from the Apollo cache with full reactivity.
 *
 * Watches fragment data and automatically updates when the cache changes.
 * Supports both single entities and arrays of entities.
 *
 * ::: danger Note
 *
 * This only works for data that can be identified by the cache via `cache.identify()`.
 * Entities must have a unique cache ID (typically `__typename` + `id`).
 *
 * :::
 *
 * @see {@link https://www.apollographql.com/docs/react/api/cache/InMemoryCache#watchfragment | Apollo Client watchFragment API}
 * @see {@link https://www.apollographql.com/docs/react/caching/cache-interaction#obtaining-an-objects-cache-id | Obtaining an object's cache ID}
 *
 * @param options - Configuration options for the fragment.
 * @returns Fragment result object with reactive refs.
 *
 * @group Composables
 *
 * @example
 * ```ts
 * const { current } = useFragment({
 *   fragment: gql`fragment UserFields on User { id name }`,
 *   from: { __typename: 'User', id: '1' },
 * })
 * ```
 */
export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables> & {
    from: MaybeRefOrGetter<Array<NonNullable<useFragment.FromValue<TData>>>>
  }>,
): useFragment.Result<Array<TData>>

/** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} */
export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables> & {
    from: MaybeRefOrGetter<Array<null>>
  }>,
): useFragment.Result<Array<null>>

/** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} */
export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables> & {
    from: MaybeRefOrGetter<Array<useFragment.FromValue<TData>>>
  }>,
): useFragment.Result<Array<TData | null>>

/** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} */
export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables> & {
    from: MaybeRefOrGetter<NonNullable<useFragment.FromValue<TData>>>
  }>,
): useFragment.Result<TData>

/** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} */
export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables> & {
    from: MaybeRefOrGetter<null>
  }>,
): useFragment.Result<null>

/** {@inheritDoc @vue/apollo-composable!useFragment:function(1)} */
export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables> & {
    from: MaybeRefOrGetter<useFragment.FromValue<TData>>
  }>,
): useFragment.Result<TData | null>

export function useFragment<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  options: MaybeRefOrGetter<useFragment.Options<TData, TVariables>>,
): useFragment.Result<TData | TData[]> {
  return useFragmentImpl<TData, TVariables>(options) as useFragment.Result<TData | TData[]>
}
// #endregion
