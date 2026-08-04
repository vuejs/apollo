# Local State

Apollo Client can store client-only state alongside server data in the same cache, and let you query both through GraphQL. This page covers when that capability is worth reaching for in a Vue Apollo app, and when Vue's native reactivity is the better tool.

## When to use Vue's reactivity

For almost everything that "local state" usually means (UI state, auth tokens, filters, current theme, modal open/closed), Vue's refs and Pinia stores are the right tool:

- They are reactive in the same way as server-fetched data through Vue Apollo.
- They have full TypeScript inference without extra setup.
- They integrate with Vue DevTools.
- They have no GraphQL-specific overhead.

```ts
import { ref } from 'vue'

export const theme = ref<'light' | 'dark'>('light')
```

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  function login(newToken: string) {
    token.value = newToken
  }
  function logout() {
    token.value = null
  }
  return { token, login, logout }
})
```

If your local state does not need to appear inside a GraphQL query, this is where it should live.

## When to use Apollo local state

Apollo's local state shines in one specific case: when you want client-only fields to participate in your GraphQL queries.

The canonical example is the `@client` directive: a query that pulls together fields from both the server and local state in a single response:

```graphql
query DashboardData {
  currentUser @client {
    id
    preferredLayout
  }
  posts {
    id
    title
  }
}
```

The `currentUser` field is resolved locally, the `posts` field is resolved by the server, and both arrive at your component as a single typed result. To make `currentUser` resolvable locally, you configure it through Apollo's [local-only fields](https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies) or [local resolvers](https://www.apollographql.com/docs/react/local-state/local-resolvers).

If you do not need the server query and the local field to come from the same place, you do not need this. Read the field from a Vue ref or Pinia store instead.

## Reactive variables

Apollo Client provides [`makeVar`](https://www.apollographql.com/docs/react/local-state/reactive-variables): a small reactive primitive that can feed into `@client` field policies. Apollo Client's React integration wraps it with a `useReactiveVar` hook that turns the reactive variable into a React state.

Vue Apollo intentionally does not ship a `useReactiveVar` composable, for two reasons:

1. Vue already has a complete reactivity system (`ref`, `computed`, `watch`).
2. For nearly all use cases, a Vue ref or Pinia store is a better fit than `makeVar`.

If you do need a reactive variable for Apollo field policies, you can read it from Vue by subscribing manually:

```ts
import { makeVar } from '@apollo/client/cache'
import { onScopeDispose, shallowRef } from 'vue'

export function useApolloReactiveVar<T>(rv: ReturnType<typeof makeVar<T>>) {
  const state = shallowRef(rv())
  const unsubscribe = rv.onNextChange(function listen(value) {
    state.value = value
    rv.onNextChange(listen)
  })
  onScopeDispose(unsubscribe)
  return state
}
```

But unless you have a specific reason to keep state inside Apollo's cache layer (custom field policies, local resolvers), reach for Vue refs or Pinia first.

## Field policies and local resolvers

When you do go the Apollo local-state route, the two mechanisms are:

- **Field policies with `read` functions.** Configure a type policy whose `read` returns the local value. Most flexible, and the recommended approach.
- **Local resolvers.** Implement resolvers for `@client` fields the same way you would for a server. Older approach; Apollo Client v4 still supports it but field policies are now preferred.

Both are documented in detail in the Apollo docs:

- [Local-only fields with field policies](https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies)
- [Local resolvers](https://www.apollographql.com/docs/react/local-state/local-resolvers)

From a Vue Apollo perspective, both work the same: query as usual, and `@client` fields resolve through your configuration rather than the network.

## A decision tree

| Goal | Tool |
|------|------|
| Component-local UI state (open/closed, active tab) | Vue ref |
| App-wide state shared across components (auth, theme) | Pinia store |
| Server data with caching | A query |
| Client-only field accessed through a GraphQL query | Apollo field policy with `read` |
| Client-only field accessed everywhere except GraphQL | Vue ref or Pinia store |

In a Vue app, you usually live in the top two and the third rows. Bottom rows only apply when you have a deliberate reason to expose local state through GraphQL.

## Next steps

- [Caching Overview](/caching/overview) explains how the cache stores entities.
- Apollo Client's [Local state management](https://www.apollographql.com/docs/react/local-state/local-state-management) for the full Apollo-side documentation.
