# Migration guide

This page walks through upgrading a Vue Apollo v4 codebase to v5 using the compatibility layer to soften the transition. The end state is fully v5-native code with no compat dependency.

For a quick scan of what changed, see [What's changed in v5](/migration/whats-changed). For the compat surface in detail, see [Compat layer](/migration/compat).

::: tip Using `<ApolloQuery>` and friends?
This page is about the composables, which are what the compat layer covers. The components
were rewritten with no compat shim, so they upgrade separately. See
[Migrating v4 components](/migration/components), and do that pass first if your templates
are where most of the Apollo code lives.
:::

## Prerequisites

Before starting:

- **Vue 3.5 or higher.** v5 drops Vue 2 support and relies on Vue 3.5 features (per-key reactive variables, top-level reactive props destructuring). If you are on Vue 3.4 or earlier, upgrade Vue first.
- **Apollo Client 4.1 or higher.** v5 uses the namespaced types and the `DataState` discriminated union introduced in Apollo Client v4.
- **Drop `vue-demi` from your project's direct dependencies** if it was there.

## Step 1: Update dependencies

::: code-group

```shell [npm]
npm install @apollo/client@^4.1 @vue/apollo-composable@next graphql
```

```shell [yarn]
yarn add @apollo/client@^4.1 @vue/apollo-composable@next graphql
```

```shell [pnpm]
pnpm add @apollo/client@^4.1 @vue/apollo-composable@next graphql
```

:::

If you used Apollo Client's deprecated `subscriptions-transport-ws` library, replace it with [`graphql-ws`](https://github.com/enisdenjo/graphql-ws). See [Subscriptions](/data/subscriptions#websocket-setup) for the new transport setup.

## Step 2: Switch imports to `@vue/apollo-composable/compat`

In every file that imports composables from `@vue/apollo-composable`, change the import path to `@vue/apollo-composable/compat`:

```ts
// Before
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'

// After
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable/compat'
```

The compat module re-exports everything from the main entry, so a single sed/find-replace is enough:

::: code-group

```shell [Find and replace]
find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.vue' \) \
  -exec sed -i '' "s|from '@vue/apollo-composable'|from '@vue/apollo-composable/compat'|g" {} +
```

```ts [VS Code]
// In Search & Replace (regex off):
// Search:  from '@vue/apollo-composable'
// Replace: from '@vue/apollo-composable/compat'
```

:::

After this step, your existing v4-style call signatures keep working: `useQuery(QUERY, vars, options)`, `mutate(variables, overrides)`, `useLazyQuery` with the 3-arg form, etc.

## Step 3: Run TypeScript and fix remaining errors

Compat preserves the call signatures but cannot reproduce Apollo Client v4's removed types. The errors you will see, and their fixes:

### `ApolloError` is removed

```ts
import { ApolloError } from '@apollo/client'
// Error: Module has no exported member 'ApolloError'
```

In v4 you could narrow errors with `instanceof ApolloError` and read `error.graphQLErrors` / `error.networkError`. In v5 the error model uses [`ErrorLike`](/data/error-handling#categories-of-errors) plus specific classes from `@apollo/client/errors`:

```ts
import { CombinedGraphQLErrors, ServerError, ServerParseError } from '@apollo/client/errors'

if (CombinedGraphQLErrors.is(error)) {
  console.log('GraphQL errors:', error.errors)
}
else if (ServerError.is(error)) {
  console.log('HTTP error:', error.statusCode)
}
else if (ServerParseError.is(error)) {
  console.log('Parse error:', error.bodyText)
}
```

Use the static `.is()` method rather than `instanceof` so the check works across realms (workers, iframes).

The compat layer types `error` as `Ref<ErrorLike | null>` (not `Ref<ApolloError | null>`), so any place you assigned `error.value` to a variable typed `ApolloError` will need to switch to `ErrorLike`.

### `useResult` is removed

```ts
import { useResult } from '@vue/apollo-composable/compat'
// Error: Module has no exported member 'useResult'
```

`useResult` was already deprecated in v4 (with a runtime warning) and is not in compat. Replace each call with a `computed`:

```ts
// Before
const items = useResult(result, [], data => data.someField.items)

// After
const items = computed(() => result.value?.someField.items ?? [])
```

### Apollo Link import path changes

If your network setup imports specific links, the import paths and class names shifted.

Before (Apollo Client v3):

```ts
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
```

After (Apollo Client v4):

```ts
import { SetContextLink } from '@apollo/client/link/context'
import { ErrorLink } from '@apollo/client/link/error'
```

The class APIs also changed; see [Apollo Client's migration guide](https://www.apollographql.com/docs/react/migrating/apollo-client-4-migration) for the link-by-link details.

### `useLazyQuery.load` third argument

If you called `load(undefined, vars, opts)` to override options at call time, the third argument is no longer accepted:

```ts
// Before (v4)
await load(undefined, { id: '1' }, { fetchPolicy: 'no-cache' })

// After
// Update the reactive options ref you passed to useLazyQuery instead.
```

v5's options ref is a `computed` with no setter, so per-call option overrides cannot be plumbed through. If you need dynamic options, mutate the reactive options argument you passed to `useLazyQuery` itself.

## Step 4: Verify behavior

Run your tests and exercise the app. Things that should now work identically to v4:

- All `useQuery`/`useSubscription` call sites with positional variables.
- `useMutation` with `mutate(variables, overrides)`.
- Flat result refs (`result`, `loading`, `error`, `networkStatus`).
- `refetch().then(r => r.data)` returns the v4-shape result object.
- `onResult` / `onDone` / `onError` callbacks receive `(payload, { client })` as the second argument.
- `useLazyQuery` with the 2-arg `load(document?, variables?)` form.

If anything misbehaves at runtime, file an issue: compat is meant to preserve v4 semantics exactly for the surface it covers.

## Step 5: Migrate to v5 native, one composable at a time

Once compat is working, you can incrementally rewrite each call site to v5-native. The patterns:

### useQuery

```ts
// Compat (v4-style)
const { result, loading, error } = useQuery(GET_USER, { id }, { fetchPolicy: 'cache-first' })

// v5 native
const { current } = useQuery(GET_USER, {
  variables: { id },
  fetchPolicy: 'cache-first',
})
// current.value.{result,resultState,loading,error,networkStatus}
```

We recommend the `current` ref for `useQuery` because `resultState` narrows the type of `result`:

```ts
if (current.value.resultState === 'complete') {
  // current.value.result is fully typed as TData
}
```

### useMutation

```ts
// Compat (v4-style)
const { mutate, loading, error } = useMutation(CREATE_TODO)
await mutate({ text: 'milk' }, { refetchQueries: [GET_TODOS] })

// v5 native
const { mutate, loading, error } = useMutation(CREATE_TODO)
await mutate({ variables: { text: 'milk' }, refetchQueries: [GET_TODOS] })
```

The result and event-hook shapes are unchanged at runtime; the only difference is `mutate`'s argument shape.

### useSubscription

```ts
// Compat (v4-style)
const { result } = useSubscription(ON_MESSAGE, { channelId })

// v5 native
const { result } = useSubscription(ON_MESSAGE, { variables: { channelId } })
```

### useLazyQuery

```ts
// Compat (v4-style)
const { load, result } = useLazyQuery(GET_USER)
await load()
await load(undefined, { id: '1' })

// v5 native
const { load, result } = useLazyQuery(GET_USER)
await load() // load() now always returns Promise<TData | undefined>
await load({ id: '1' }) // variables passed directly as the first arg
```

### Event hooks

```ts
// Compat (v4-style): second { client } argument
onResult((result, { client }) => { /* ... */ })

// v5 native: no context argument
const { client } = useApolloClient()
onResult((result) => {
  // use `client` from the enclosing scope if you need it
})
```

### Reactive variables

v5 supports a per-key reactive variables form that v4 did not:

```ts
// Both versions: whole-object form
useQuery(QUERY, () => ({ variables: { id: someRef.value } }))

// v5 only: per-key form
useQuery(QUERY, { variables: { id: someRef } })
```

The per-key form is cleaner when you have several reactive variables in the same query.

## Step 6: Drop the compat import path

Once every call site in a file is v5-native, change the import back to `@vue/apollo-composable`:

```ts
// After (v5 native)
import { useMutation, useQuery } from '@vue/apollo-composable'

// Before (compat)
import { useMutation, useQuery } from '@vue/apollo-composable/compat'
```

Migrate file by file. Both import paths coexist for as long as you need.

When no file imports from `/compat` anymore, the migration is complete. Search the codebase for the string `@vue/apollo-composable/compat` to confirm.

## Common gotchas

### `subscribeToMore` with reactive options

In v4, `subscribeToMore` accepted a ref or getter for its options and re-subscribed when they changed. In v5 (and compat) it takes static options. The replacement is a `watch`:

```ts
const { subscribeToMore } = useQuery(GET_MESSAGES, { variables: { channelId } })

let unsubscribe: (() => void) | undefined

watch(
  () => current.value.resultState === 'complete' && channelId.value,
  () => {
    unsubscribe?.()
    unsubscribe = subscribeToMore({
      document: ON_NEW_MESSAGE,
      variables: { channelId: channelId.value },
      updateQuery: (_prev, { subscriptionData, previousData, complete }) => {
        if (!complete)
          return
        if (!subscriptionData.data)
          return
        return {
          ...previousData,
          messages: [...previousData.messages, subscriptionData.data.newMessage],
        }
      },
    })
  },
)

onUnmounted(() => unsubscribe?.())
```

See [Subscriptions: subscribing to query updates](/data/subscriptions#subscribing-to-query-updates).

### `forceDisabled` ref on `useQuery`

v4 exposed a `forceDisabled` ref on the return object. v5 does not. Use `start()` and `stop()` for the same effect:

```ts
// v4
query.forceDisabled.value = true // pause

// v5 and compat
query.stop() // pause
query.start() // resume
```

### Subscription's `subscription` ref

v4's `useSubscription` exposed a `subscription` ref holding the raw rxjs `Observable`. v5 and compat do not surface it. If you were reaching into this for advanced cases, you can construct the equivalent observable directly with `client.subscribe`.

### `vue-demi` removed

If your code imported `Ref`, `computed`, etc. from `vue-demi`, switch to `vue`:

```ts
import type { Ref } from 'vue'
import type { Ref } from 'vue-demi'

// After
import { computed, ref } from 'vue'
// Before
import { computed, ref } from 'vue-demi'
```

## Next steps

- [Compat layer](/migration/compat) covers the compat module in detail, including its known gaps.
- [What's changed in v5](/migration/whats-changed) is the reference companion to this guide.
- [Migrating v4 components](/migration/components) covers `@vue/apollo-components`, which compat does not.
- [Queries](/data/queries), [Mutations](/data/mutations), and [Subscriptions](/data/subscriptions) cover the v5 API in depth.
