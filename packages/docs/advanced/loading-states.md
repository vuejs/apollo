# Loading States

Each composable exposes its own `loading` ref, but real apps often want to combine them: a single indicator for the whole page, an app-wide loading bar, a "saving" toast that tracks every mutation. Vue Apollo ships six composables for aggregating loading state across multiple operations.

| Scope | Queries | Mutations | Subscriptions |
|-------|---------|-----------|---------------|
| Current effect scope (usually a component) | `useQueryLoading` | `useMutationLoading` | `useSubscriptionLoading` |
| Whole app | `useGlobalQueryLoading` | `useGlobalMutationLoading` | `useGlobalSubscriptionLoading` |

The per-scope composables track every `useQuery`/`useMutation`/`useSubscription` called within the current Vue effect scope (typically the component that calls them, plus anything they call recursively). The global composables track every operation in the entire app.

## Per-scope loading

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery, useQueryLoading } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<any, any>
declare const GET_USERS: TypedDocumentNode<{ users: { id: string, name: string }[] }, {}>
declare const GET_POSTS: TypedDocumentNode<{ posts: { id: string, title: string }[] }, {}>
// ---cut---
const { current: users } = useQuery(GET_USERS)
const { current: posts } = useQuery(GET_POSTS)

// True while any query in this component is loading
const loading = useQueryLoading()
</script>

<template>
  <div v-if="loading">
    Loading...
  </div>
  <div v-else>
    <!-- Render data -->
  </div>
</template>
```

`useQueryLoading` returns a computed ref that is `true` while at least one query in the current scope is in flight. It is reactive: as queries finish, the ref flips back to `false`.

Use the same shape for mutations and subscriptions:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation, useMutationLoading } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ updateUser: { id: string } }, { id: string }>
const UPDATE_USER: TypedDocumentNode<{ updateUser: { id: string } }, { id: string }> = gql``
// ---cut---
const { mutate: updateUser } = useMutation(UPDATE_USER)
const saving = useMutationLoading()
```

Per-scope tracking is automatically scoped to the component that calls these composables. The same composable in a sibling component does not affect this scope.

## Global loading

`useGlobalQueryLoading`, `useGlobalMutationLoading`, and `useGlobalSubscriptionLoading` track every operation in the entire app. Useful for app-shell loading indicators:

```vue twoslash
<script setup lang="ts">
import { useGlobalQueryLoading } from '@vue/apollo-composable'

const loading = useGlobalQueryLoading()
</script>

<template>
  <header>
    <div v-if="loading" class="loading-bar" />
  </header>
  <main>
    <slot />
  </main>
</template>
```

Unlike the per-scope variants, the global composables can be called anywhere, including outside a component setup.

## Restrictions

- The per-scope composables must be called inside an effect scope (typically a `<script setup>` block, a Vue plugin, or anywhere `getCurrentScope()` returns a scope). They throw outside.
- The global composables have no such restriction.

## When to choose which

| Goal | Composable |
|------|------------|
| Loading indicator for a specific component or section | Per-scope: `useQueryLoading`, etc. |
| App-wide top loading bar | Global: `useGlobalQueryLoading` |
| Disable a button while a specific mutation is in flight | `loading` ref returned by that `useMutation` directly |
| Combine queries and mutations into one indicator | Two refs, combined with `computed(() => queries.value || saving.value)` |

For the "indicator for one specific operation" case, do not reach for these composables. Use the `loading` ref the original composable returned:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useMutation } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<any, any>
const SAVE: TypedDocumentNode<any, any> = gql``
// ---cut---
const { mutate: save, loading } = useMutation(SAVE)
// `loading` is true while this specific save is running
```

## Combining categories

Want a single indicator that flips on while any operation is running? Compose them:

```ts twoslash
import { useGlobalMutationLoading, useGlobalQueryLoading, useGlobalSubscriptionLoading } from '@vue/apollo-composable'
import { computed } from 'vue'
// ---cut---
const queries = useGlobalQueryLoading()
const mutations = useGlobalMutationLoading()
const subscriptions = useGlobalSubscriptionLoading()

const anyLoading = computed(
  () => queries.value || mutations.value || subscriptions.value,
)
```

## SSR

The global composables avoid cross-request contamination during SSR. Each server request gets isolated tracking, so a slow request from one user does not affect another. You can safely use them in components that render on the server.

The per-scope composables are also SSR-safe, but the counters are scoped to the current request's effect scope.

## Next steps

- [Queries](/data/queries) for the `loading` ref on individual `useQuery` calls.
- [Mutations](/data/mutations) for the `loading` ref on `useMutation`.
- [Suspense](/data/suspense) for a different approach to coarse-grained loading.
