# What's changed in v5

This page is a high-level reference of what changed between Vue Apollo v4 and v5. For a step-by-step walkthrough, see the [Migration guide](/migration/guide). For the compatibility layer that smooths the transition, see [Compat layer](/migration/compat). If your app uses `<ApolloQuery>` and friends, see [Migrating v4 components](/migration/components).

## Why v5

Most of the surface change is driven by [Apollo Client v4](https://www.apollographql.com/docs/react/migrating/apollo-client-4-migration). Apollo Client v4 introduced:

- A `DataState` discriminated union with `empty` / `partial` / `complete` / `streaming` states.
- A new error model: the class-based `ApolloError` was replaced by an `ErrorLike` plus specific error classes (`CombinedGraphQLErrors`, `ServerError`, etc.).
- Namespaced types (`ApolloClient.MutateOptions` replacing `MutationOptions`).
- Native `@defer` and `@stream` support via an incremental delivery handler.

Vue Apollo v5 surfaces these in a Vue-native way. It also drops Vue 2 support: the peer dep is now Vue 3.5+, the package no longer ships through `vue-demi`.

## Composable signature changes

The biggest breaking change: variables moved from a positional argument into options.

### useQuery

| | v4 | v5 |
|---|---|---|
| No vars | `useQuery(QUERY)` | `useQuery(QUERY)` |
| With vars | `useQuery(QUERY, { id })` | `useQuery(QUERY, { variables: { id } })` |
| Vars + options | `useQuery(QUERY, { id }, { fetchPolicy: 'no-cache' })` | `useQuery(QUERY, { variables: { id }, fetchPolicy: 'no-cache' })` |

### useSubscription

Same shape change as `useQuery`. Variables move into options.

### useMutation

The composable signature is unchanged: `useMutation(MUTATION, options?)`. The change is in the `mutate` function:

| | v4 | v5 |
|---|---|---|
| Mutate with vars | `mutate({ id, text })` | `mutate({ variables: { id, text } })` |
| Mutate with vars + overrides | `mutate({ id, text }, { fetchPolicy: 'no-cache' })` | `mutate({ variables: { id, text }, fetchPolicy: 'no-cache' })` |

### useLazyQuery

| | v4 | v5 |
|---|---|---|
| Composable | `useLazyQuery(QUERY, { id }, options)` | `useLazyQuery(QUERY, { variables: { id }, ...options })` |
| `load()` | `load(undefined, { id })` | `load({ id })` |
| `load` return | `false \| Promise<TData>` | `Promise<TData \| undefined>` (always a Promise) |

## Return-shape changes

v5 adds a `current` ref containing a discriminated union, alongside the v4-style flat refs. For `useQuery` and `useFragment`, we recommend `current` because `resultState` narrows the type of `result`:

```ts
const { current } = useQuery(GET_USER)

if (current.value.resultState === 'complete') {
  // current.value.result is fully typed as TData
  console.log(current.value.result.user.name)
}
```

The flat refs (`result`, `loading`, `error`, `networkStatus`) remain available, so v4 code continues to work after the signature changes.

`useMutation` and `useSubscription` keep their flat-ref-only shape because their results do not have multiple data states.

See [TypeScript: Result shapes](/data/typescript#result-shapes) for the full comparison.

## Error type

The v3-era `ApolloError` class is gone from Apollo Client v4. v5 types `error` as `ErrorLike | undefined`:

| | v4 | v5 |
|---|---|---|
| Type | `Ref<ApolloError \| null>` | `Ref<ErrorLike \| undefined>` |
| Detect kind | `error instanceof ApolloError` | `CombinedGraphQLErrors.is(error)` |
| Access GraphQL errors | `error.graphQLErrors` | After narrowing with `.is()`, `error.errors` on `CombinedGraphQLErrors` |
| Access network error | `error.networkError` | After narrowing with `.is()`, the error class itself (`ServerError`, `ServerParseError`, etc.) |

The error classes ship from `@apollo/client/errors`. See [Error Handling](/data/error-handling#identifying-error-types) for the full pattern.

## Event hook callbacks

v4's `onResult`, `onError`, and `onDone` callbacks received a second argument `{ client }`. v5 drops it:

```ts
// v4
onResult((result, { client }) => {
  console.log(result, client)
})
onError((error, { client }) => {
  console.error(error, client)
})

// v5
onResult((result) => {
  console.log(result)
})
onError((error) => {
  console.error(error)
})
```

If you need the client inside the callback, use `useApolloClient()` from the surrounding scope.

## Removed APIs

| Removed | Replacement |
|---|---|
| `useResult(result, defaultValue, picker)` | `computed(() => result.value?.someField ?? defaultValue)` |
| `forceDisabled` on `useQuery` return | Use `start()` / `stop()` |
| Reactive options on `subscribeToMore` | `watch(...)` and manually re-call `subscribeToMore` |

`useResult` was already deprecated in v4 (with a console warning telling users to use `computed`). It is fully removed in v5.

## Added APIs

| Added | Purpose |
|---|---|
| `useFragment` | Read fragment data from the cache reactively via Apollo Client v4's `watchFragment` |
| `current` ref on `useQuery` and `useFragment` | Discriminated union of result + state for type-safe narrowing |
| `current.resultState` | `'empty' \| 'partial' \| 'streaming' \| 'complete'` |
| `awaitComplete` option on `useQuery` | When `await`ed, wait for the full streamed response rather than the first chunk |
| `onNextState`, `onCompleteResult`, `onPartialResult`, `onStreamingResult` | Granular event hooks for state transitions and result variants |

## Variables reactivity

v4 accepted variables as a value, a ref, or a getter (the whole-object form). v5 still accepts those, and adds a per-key form so individual variable values can be reactive without wrapping the whole object:

```ts
// v4 and v5 (whole-object form, still works)
useQuery(QUERY, () => ({ id: someRef.value }))

// v5 only (per-key form)
useQuery(QUERY, { variables: { id: someRef } })
```

In the per-key form, each value can independently be a ref, a getter, or a plain value.

## Apollo Client peer dep

| | v4 | v5 |
|---|---|---|
| Apollo Client | `^3.0.0` | `^4.1.0` |
| Vue | `^2.7.0 \|\| ^3.0.0` (via `vue-demi`) | `^3.5.0` |
| Removed deps | | `vue-demi`, `throttle-debounce` |
| Added deps | | `@vueuse/core`, `@wry/equality`, `rxjs` |

Internal utilities that v4 maintained (`paramToReactive`, `paramToRef`, `useEventHook`, `toApolloError`, etc.) are gone in v5.

## Components

`@vue/apollo-components` is still published, and `<ApolloQuery>`, `<ApolloMutation>` and `<ApolloSubscribeToMore>` still have their v4 names. What changed:

| | v4 | v5 |
|---|---|---|
| Built on | `@vue/apollo-option` and `this.$apollo` | `@vue/apollo-composable` |
| Setup | `app.use(apolloProvider)` | `app.provide(DefaultApolloClient, client)` |
| Rendering | A `<div>` wrapper, configurable with `tag` | Renderless |
| `<ApolloQuery>` slots | One default slot with a `result` object | `#loading` / `#error` / `#empty` / `#data`, plus the default slot |
| Typing | Untyped slot props | Slot props and event payloads inferred from the document |
| Added | | `<ApolloSubscription>`, `<ApolloFragment>` |
| Removed | | `@vue/apollo-option`, and with it the Options API integration |

There is no compat layer for the components. See [Migrating v4 components](/migration/components) for the prop, slot and event tables.

## Next steps

- [Migration guide](/migration/guide) walks through the upgrade step by step.
- [Compat layer](/migration/compat) lets v4-style call signatures keep working during migration.
- [Migrating v4 components](/migration/components) covers `<ApolloQuery>` and friends.
- [Components API](/api/components/) lists every prop, event and slot.
- [TypeScript](/data/typescript) covers the new type-narrowing patterns.
