# Compat layer

`@vue/apollo-composable/compat` is a sub-export of the same package that exposes v4-style call signatures over v5 internals. It exists to let v4 users upgrade to v5 without rewriting every call site at once.

For a step-by-step migration that uses this layer, see the [Migration guide](/migration/guide). For a high-level summary of the v4 to v5 changes, see [What's changed in v5](/migration/whats-changed).

## Purpose

Vue Apollo v5 introduced breaking changes to nearly every composable's call signature (variables moved into options, `mutate(variables)` became `mutate({ variables })`, the error type changed). Migrating a large codebase line-by-line in one shot is painful. The compat layer keeps the v4 surface compilable while you do the rest of the upgrade incrementally.

The goal is migration ergonomics, not full backward compatibility. Apollo Client v4 removed some APIs (notably the `ApolloError` class) that compat cannot bring back. Where v4 patterns cannot be preserved, compat opts to either approximate them or leave them out and surface a TypeScript error so the issue is visible at compile time.

## Installation

No separate package. The compat module ships inside `@vue/apollo-composable`:

```ts
// Switch the import path from
import { useMutation, useQuery } from '@vue/apollo-composable'
// to
import { useMutation, useQuery } from '@vue/apollo-composable/compat'
```

The compat module re-exports everything from the main entry, so a single find-replace across your codebase is usually enough.

## What's exported

### v4-style wrappers

| Composable | v4 signature preserved | Notes |
|---|---|---|
| `useQuery` | `useQuery(doc)`, `useQuery(doc, vars)`, `useQuery(doc, vars, options)`, `useQuery(doc, undefined, options)` | Variables can be positional or in options. |
| `useSubscription` | Same 3-arg form as `useQuery` | Variables can be positional or in options. |
| `useMutation` | `useMutation(doc, options?)`. `mutate(variables, overrides)` keeps the v4 two-arg form. | The composable signature was already compatible; the call signature is wrapped. |
| `useLazyQuery` | `useLazyQuery(doc, vars?, options?)`. `load(document?, variables?)` keeps v4's two-arg form and first-call-only semantics. | See [`useLazyQuery` notes](#uselazyquery) below. |

### Return-shape wrapping

Compat returns the v4-style flat refs only (no `current` ref). Specifically:

- `error` is typed `Ref<ErrorLike | null>` (the v4 shape with v5's error type).
- `refetch` resolves with `{ data, ... }` (v4) rather than `{ result, ... }` (v5).
- `fetchMore` resolves the v5 shape (`{ result, ... }`) since v4's `fetchMore` already had that as `data`. We re-expose v5's `fetchMore` directly.
- `onResult`, `onError`, `onDone` callbacks receive a second `{ client }` argument as v4 did.

### Re-exports from the main entry

These APIs are unchanged between v4 and v5, and compat re-exports them so callers do not have to mix import paths:

- `useApolloClient`
- `provideApolloClient`
- `provideApolloClients`
- `useFragment` (v5-only, useful in the same file)
- `useQueryLoading`, `useMutationLoading`, `useSubscriptionLoading`
- `useGlobalQueryLoading`, `useGlobalMutationLoading`, `useGlobalSubscriptionLoading`
- `ApolloClients`, `DefaultApolloClient` (injection key symbols)

### Type exports

Compat exports the v4 type names so existing type annotations keep compiling:

- `UseQueryOptions`, `UseQueryReturn`
- `UseMutationOptions`, `UseMutationReturn`, `MutateFunction`, `MutateOverrideOptions`, `MutateResult`
- `UseSubscriptionOptions`, `UseSubscriptionReturn`
- `UseLazyQueryReturn`
- `UseApolloClientReturn` (ignores its `TCacheShape` generic since Apollo Client v4 dropped it)
- `DocumentParameter`, `VariablesParameter`, `OptionsParameter`
- Event-hook context types: `UseQueryOnResultContext`, `UseQueryOnErrorContext`, etc.

## What's not included

Some v4 APIs cannot be reproduced and are documented gaps:

### `useResult`

Already deprecated in v4 with a runtime warning telling users to migrate to `computed`. Not in compat. Replace each call with:

```ts
// Before
const items = useResult(result, [], data => data.someField.items)

// After
const items = computed(() => result.value?.someField.items ?? [])
```

### `ApolloError` class

Apollo Client v4 removed the class. Compat types `error` as `Ref<ErrorLike | null>`. Code that did `error instanceof ApolloError` or read `error.graphQLErrors` / `error.networkError` needs to switch to Apollo Client v4's error classes:

```ts
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors'

if (CombinedGraphQLErrors.is(error)) {
  console.log(error.errors)
}
else if (ServerError.is(error)) {
  console.log(error.statusCode)
}
```

See [Error Handling: identifying error types](/data/error-handling#identifying-error-types).

### `useLazyQuery.load` third argument

v4's `load` accepted `(document?, variables?, options?)`. Compat accepts `(document?, variables?)`. The third arg is dropped from the signature so passing it produces a TypeScript error rather than a silent no-op.

The reason: v5 wraps options in a `computed` with no setter, so per-call option overrides cannot be plumbed through. If you need dynamic options, mutate the reactive options argument you passed to `useLazyQuery` itself.

### `forceDisabled` ref on `useQuery` return

v4 exposed `forceDisabled` as part of `UseQueryReturn`. Compat does not. Use `start()` and `stop()` for the same effect.

### Reactive options on `subscribeToMore`

v4's `subscribeToMore` accepted a ref or getter for its options and re-subscribed when they changed. Compat exposes v5's static-options form. Replace with a `watch` that calls `subscribeToMore` manually:

```ts
// `someReactiveCondition` is the dependency that should trigger re-subscribe
watch(
  () => someReactiveCondition,
  () => {
    unsubscribe?.()
    unsubscribe = subscribeToMore({
      // subscribe options
    })
  },
)
```

### `subscription` ref on `useSubscription` return

v4 exposed a `subscription: Ref<Observable | null>` field. Compat does not. The rxjs observable is internal in v5.

## `useLazyQuery` notes

v5 changed `useLazyQuery.load` semantics significantly. The compat wrapper preserves v4 behavior:

- **Signature**: `load(document?, variables?)`. The third options argument was dropped (see [above](#uselazyquery-load-third-argument)).
- **First-call-only**: The first call returns a Promise. Subsequent calls return `false` (matches v4). If you need to re-run with different variables, mutate the reactive variables ref/getter you passed to `useLazyQuery`, or call `refetch(newVariables)` on the returned query.
- **Variables: replace, not merge**: When you pass variables to `load(undefined, vars)`, they REPLACE the current variables. v5's native `load(vars)` merges. Compat matches v4 here.
- **Document override**: Works if the document argument to `useLazyQuery` was a plain value or a writable ref. If it was a getter, Vue will warn on assignment and the override will not take effect. This is the same behavior v4 had.

## Composable return-value shapes

The exact shapes compat returns from each composable:

### `useQuery` and `useLazyQuery`

```
{
  result:          Ref<TResult | undefined>
  loading:         Ref<boolean>
  networkStatus:   Ref<number | undefined>
  error:           Ref<ErrorLike | null>
  start:           () => void
  stop:            () => void
  restart:         () => void
  document:        Ref<DocumentNode>
  variables:       Ref<TVariables>
  options:         Ref<UseQueryOptions<TResult, TVariables> | undefined>
  query:           Ref<ObservableQuery<TResult, TVariables> | undefined>
  refetch:         (variables?) => Promise<{ data, ... } | undefined>
  fetchMore:       (options) => Promise<{ result, ... }> | undefined
  updateQuery:     (mapFn) => void
  subscribeToMore: (options) => (() => void) | undefined
  onResult:        (fn: (result, { client }) => void) => { off: () => void }
  onError:         (fn: (error, { client }) => void) => { off: () => void }
  // useLazyQuery adds:
  load:            (document?, variables?) => false | Promise<TResult | undefined>
}
```

### `useMutation`

```
{
  mutate:  (variables?, overrideOptions?) => Promise<{ data, error?, extensions? } | null>
  loading: Ref<boolean>
  error:   Ref<ErrorLike | null>
  called:  Ref<boolean>
  onDone:  (fn: (result, { client }) => void) => { off: () => void }
  onError: (fn: (error, { client }) => void) => { off: () => void }
}
```

### `useSubscription`

```
{
  result:    Ref<TResult | undefined>
  loading:   Ref<boolean>
  error:     Ref<ErrorLike | null>
  start:     () => void
  stop:      () => void
  restart:   () => void
  document:  Ref<DocumentNode>
  variables: Ref<TVariables>
  options:   Ref<UseSubscriptionOptions<TResult, TVariables> | undefined>
  onResult:  (fn: (result: { data, ... }, { client }) => void) => { off: () => void }
  onError:   (fn: (error, { client }) => void) => { off: () => void }
}
```

## When to drop compat

Compat is meant to be temporary. To remove it, follow the [Migration guide](/migration/guide#step-5-migrate-to-v5-native-one-composable-at-a-time): convert each call site to v5-native, then change the import path back to `@vue/apollo-composable`. Once no file imports from `/compat` anymore, the migration is complete.

There is no deprecation timeline on the compat module itself, but every new feature lands on the v5-native API, not compat. The longer you stay on compat, the more v5 features you miss out on (notably the `current` discriminated union and the `@defer`/`@stream` workflows).

## Next steps

- [Migration guide](/migration/guide) is the prescriptive walkthrough.
- [What's changed in v5](/migration/whats-changed) is the high-level reference.
- [TypeScript: Composable return-value shapes](/data/typescript#composable-return-value-shapes) compares v5 native composable shapes.
