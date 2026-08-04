# Migrating v4 components

v4 shipped `@vue/apollo-components`, a set of renderless components built on `@vue/apollo-option` and its `this.$apollo` smart-query layer. v5 keeps the package and the element names, and rebuilds them on top of [`@vue/apollo-composable`](/api/composable/).

This page lists what moved.

::: warning No compat layer for components
[`@vue/apollo-composable/compat`](/migration/compat) covers the composables only. The
components are a from-scratch rewrite with no v4-signature shim, so the changes here have
to be made before the app runs.

The changes are mechanical and mostly confined to templates, so a codebase-wide search for
`<ApolloQuery` is a good way to scope the work.
:::

## Step 1: Dependencies

`@vue/apollo-option` is gone. The components now depend on the composables:

::: code-group

```shell [npm]
npm uninstall @vue/apollo-option
npm install @apollo/client@^4.1 @vue/apollo-composable@next @vue/apollo-components@next graphql
```

```shell [yarn]
yarn remove @vue/apollo-option
yarn add @apollo/client@^4.1 @vue/apollo-composable@next @vue/apollo-components@next graphql
```

```shell [pnpm]
pnpm remove @vue/apollo-option
pnpm add @apollo/client@^4.1 @vue/apollo-composable@next @vue/apollo-components@next graphql
```

:::

## Step 2: Client setup

v4 registered an `ApolloProvider`. v5 provides the client itself, the same way the composables do:

```ts
// Before (v4)
import { createApolloProvider } from '@vue/apollo-option'

const apolloProvider = createApolloProvider({ defaultClient: apolloClient })

createApp(App)
  .use(apolloProvider)
  .mount('#app')
```

```ts
// After (v5)
import { DefaultApolloClient } from '@vue/apollo-composable'

createApp(App)
  .provide(DefaultApolloClient, apolloClient)
  .mount('#app')
```

For several clients, provide `ApolloClients` instead. See [Multiple Clients](/advanced/multiple-clients).

## Step 3: Registration

v4 auto-installed from a global `Vue`, and its plugin was exported as `ApolloProvider`. v5 exports `VueApolloComponents`, and prefers direct imports:

```ts
// Before (v4)
import { ApolloProvider } from '@vue/apollo-components'

app.use(ApolloProvider)
```

```ts
// After (v5), global
import { VueApolloComponents } from '@vue/apollo-components'

app.use(VueApolloComponents)
```

```vue
<!-- After (v5), preferred -->
<script setup lang="ts">
import { ApolloQuery } from '@vue/apollo-components'
</script>
```

Global registration loses the generic slot-prop types, so `data` in `#data` falls back to `any`. Import the components where you use them to keep them typed.

## Step 4: The wrapper element is gone

Every v4 component rendered a `<div>` around its slot content, configurable with the `tag` prop. The v5 components render exactly what their slots return and nothing else.

```vue-html
<!-- v4: this produced <div><ul>...</ul></div> -->
<ApolloQuery :query="GetDogs">
  ...
</ApolloQuery>
```

Delete any `tag` prop, and check styling that relied on the wrapper. If you need one back, write it yourself:

```vue-html
<div class="panel">
  <ApolloQuery :query="GetDogs">
    ...
  </ApolloQuery>
</div>
```

::: tip Multiple roots
Because the components are renderless, an [`<ApolloQuery>`](/api/components/ApolloQuery)
that renders several elements makes its parent a multi-root component. That is fine in
Vue 3, but attribute fallthrough stops working, so wrap it if the parent passes `class` or
`style` down.
:::

## `<ApolloQuery>`

### Props

| v4 | v5 |
|---|---|
| `query` (document or `gql => document`) | `query`, a document only. Use a `TypedDocumentNode` to get typed slots. |
| `variables` | `variables`, typed from the document |
| `skip` | `disabled` |
| `fetchPolicy` | Same name |
| `pollInterval` | Same name |
| `debounce`, `throttle` (default `0`) | Same names, no default. Absent means no delay. |
| `clientId` | Same name |
| `update` (transform the data) | Removed. Transform inside the slot, or with a cache field policy. |
| `notifyOnNetworkStatusChange`, `context`, `deep`, `prefetch` | Through `options`, where the option still exists in Apollo Client v4 |
| `tag` | Removed, see above |
| `options` | `options`, now the whole [`useQuery.Options`](/api/composable/@vue/namespaces/useQuery/interfaces/Options) object |

`skip` to `disabled` is a rename only; the meaning is identical. See [Disabling queries](/data/queries#disabling-queries).

### Slots

v4 had one slot, handing you a result object to branch on yourself. v5 adds named slots that do the branching, and keeps a default slot for when you would rather do it yourself:

```vue-html
<!-- Before (v4) -->
<ApolloQuery v-slot="{ result: { data, loading, error } }" :query="GetDogs">
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else-if="data">
    <li v-for="dog in data.dogs" :key="dog.id">{{ dog.breed }}</li>
  </ul>
</ApolloQuery>
```

```vue-html
<!-- After (v5) -->
<ApolloQuery :query="GetDogs">
  <template #loading>
    Loading...
  </template>
  <template #error="{ error }">
    {{ error.message }}
  </template>
  <template #data="{ data }">
    <ul>
      <li v-for="dog in data.dogs" :key="dog.id">
        {{ dog.breed }}
      </li>
    </ul>
  </template>
</ApolloQuery>
```

`#empty` is new, and it is the last branch in the chain: a query that settles with no result, no error and nothing in flight renders it where v4 rendered nothing. Add the `empty` prop, a predicate over the result, to also catch results that arrived but count as empty, such as a zero-length list. A `disabled` query is the exception and still renders nothing at all.

The slot-prop names changed too:

| v4 slot prop | v5 |
|---|---|
| `result.data` | `data` in `#data`, never `undefined` there. `result` in the default slot. |
| `result.loading` | `loading`, in `#data` and in the default slot |
| `result.error` | `error`, in `#error`, `#data` and the default slot. In `#data` it means the query failed but there is still something to show. |
| `result.networkStatus` | `networkStatus`, default slot only |
| `result.fullData` | Removed, along with the `update` prop it existed for |
| `isLoading` | `loading` |
| `gqlError` | Removed. Narrow with `CombinedGraphQLErrors.is(error)`, see [Error Handling](/data/error-handling#identifying-error-types). |
| `times` | Removed |
| `query` | On the exposed result, through a template ref |

A straight port keeps the `v-if` chain and uses only the default slot, which is a valid v5 form. Moving to the named slots is worth doing though: `data` is non-nullable inside `#data`, so the optional chaining v4 needed disappears. [Two ways to read the result](/data/queries#two-ways-to-read-the-result) covers both modes.

### Events

| v4 | v5 |
|---|---|
| `@loading="isLoading => ..."` | Removed. Read the `loading` slot prop. |
| `@result="result => ..."`, receiving `{ data, loading, error, ... }` | `@result="data => ..."`, receiving the data alone. `@nextState` gives the whole state. |
| `@error="error => ..."` | Same name. The payload is an `ErrorLike` rather than a v3 `ApolloError`. |

v5 also emits `@completeResult`, `@partialResult` and `@streamingResult`. See [Event hooks](/data/queries#event-hooks).

### Retaining results between variable changes

v4's `<ApolloQuery>` merged the previous data into the new result while loading, so a variables change never blanked the list. v5 does not do this unless asked:

```vue-html
<ApolloQuery :query="SearchProducts" :variables="{ term }" keepPreviousResult>
```

The retained result is flagged with the `isPreviousResult` slot prop, which v4 had no equivalent for, so a stale list can be styled as stale. See [Keeping previous data](/data/queries#keeping-previous-data).

## `<ApolloMutation>`

### Props

| v4 | v5 |
|---|---|
| `mutation` (document or `gql => document`) | `mutation`, a document only |
| `variables` | `variables`, typed from the document |
| `clientId` | Same name |
| `optimisticResponse`, `update`, `refetchQueries`, `context` | Through `options`, typed as [`useMutation.Options`](/api/composable/@vue/namespaces/useMutation/interfaces/Options) |
| `tag` | Removed |

```vue-html
<!-- Before (v4) -->
<ApolloMutation
  :mutation="AddTodo"
  :variables="{ text }"
  :refetchQueries="() => ['GetTodos']"
/>
```

```vue-html
<!-- After (v5) -->
<ApolloMutation
  :mutation="AddTodo"
  :variables="{ text }"
  :options="{ refetchQueries: ['GetTodos'] }"
/>
```

### `mutate()`

[`<ApolloMutation>`](/api/components/ApolloMutation)'s `mutate` slot prop now takes an options object rather than bare variables, matching `useMutation`:

```vue-html
<!-- Before (v4) -->
<button @click="mutate({ text })">Add</button>
```

```vue-html
<!-- After (v5) -->
<button @click="mutate({ variables: { text } })">Add</button>
```

Calling it with no arguments still uses the `variables` prop, as in v4.

### Slot props and events

`mutate`, `loading` and `error` are unchanged. `gqlError` is gone, for the same reason as on `<ApolloQuery>`. v5 adds `called`, `result` and `reset`.

`@done` and `@error` keep their names. `@loading` is gone; use the `loading` slot prop.

v4's `mutate` caught every error and resolved with `undefined`. v5's rejects instead: `throws` defaults to `'auto'`, and the component bridges `@error` to `useMutation`'s `onError` only while the parent is actually listening, so with nothing bound there is no handler and the promise rejects. A v4 call site that never expected a rejection needs one of two things: bind `@error`, which makes `mutate()` resolve again and delivers the failure to the event, or set `:options="{ throws: 'never' }"` and read the `error` slot prop. See [Error throwing behavior](/data/mutations#error-throwing-behavior).

## `<ApolloSubscribeToMore>`

[`<ApolloSubscribeToMore>`](/api/components/ApolloSubscribeToMore) keeps its name and its placement: it still takes `document`, `variables` and `updateQuery`, and still has to sit inside an `<ApolloQuery>`.

There is one addition: a `context` prop, passed to the link chain for this subscription. v4 had no equivalent, so there is nothing to migrate; it is there for headers and link state that only the subscription needs.

One difference:

- Changing `updateQuery` alone does not re-subscribe. Only `document`, `variables` and `context` do.

```vue-html
<ApolloQuery :query="GetMessages" :variables="{ channelId }">
  <ApolloSubscribeToMore
    :document="OnNewMessage"
    :variables="{ channelId }"
    :updateQuery="mergeMessage"
  />
  <template #data="{ data }">
    ...
  </template>
</ApolloQuery>
```

Note that it now lives in the default slot rather than beside a single slot's content. The default slot renders in both modes.

## New in v5

Two components have no v4 equivalent:

- [`<ApolloSubscription>`](/api/components/ApolloSubscription) runs a standalone subscription, which v4 could only do through `this.$apollo.addSmartSubscription`. See [Subscriptions](/data/subscriptions).
- [`<ApolloFragment>`](/api/components/ApolloFragment) reads a fragment from the cache. It is what makes the components usable with [data masking](/data/data-masking), where a component receives a masked object and has to unmask the fields it owns. See [Fragments](/data/fragments).

## What has no component form

- **Lazy queries.** See [Lazy Queries](/advanced/lazy-queries); `disabled` covers the "wait for variables" case.
- **Suspense.** See [Suspense](/data/suspense).
- **Aggregate loading counters.** `useQueryLoading` and friends are scoped per component instance, so they cannot see a child `<ApolloQuery>`. See [Loading States](/advanced/loading-states).

The two APIs share one client and one cache, so mixing them is expected. Reach for `<script setup>` in the components that need it and keep the templates declarative everywhere else.

## Next steps

- [Migration guide](/migration/guide) covers the composables, including the compat layer.
- [What's changed in v5](/migration/whats-changed) is the reference companion.
- [Components API](/api/components/) lists every prop, event and slot.
