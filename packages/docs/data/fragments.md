# Fragments

A [GraphQL fragment](http://graphql.org/learn/queries/#fragments) is a reusable set of fields you can spread into multiple queries and mutations. They are especially useful for [colocating data requirements](#colocating-fragments) with the components that render them.

## Defining fragments

Define a fragment on a specific GraphQL type:

```ts
const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    email
  }
`
```

Include the fragment in a query with the spread operator and interpolation:

```ts
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
      avatar
    }
  }
  ${USER_FRAGMENT}
`
```

## Reading fragment data with `useFragment`

[`useFragment`](/api/composable/functions/useFragment) creates a reactive binding to fragment data in the Apollo cache. It watches for changes and updates automatically when the cache changes.

::: warning Cache identification required
`useFragment` only works with entities the cache can identify. Each entity needs a unique cache ID, normally `__typename` plus the entity's key field (usually `id`).
:::

```vue twoslash
<script setup lang="ts">
import { DocumentNode, TypedDocumentNode } from '@apollo/client'
import { useFragment } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => DocumentNode

interface UserFieldsFragment { id: string, name: string, email: string }
declare const USER_FRAGMENT: TypedDocumentNode<UserFieldsFragment>
// ---cut---
const { user } = defineProps<{ user: { __typename: 'User', id: string } }>()

const { current } = useFragment({
  fragment: USER_FRAGMENT,
  from: () => user,
})
</script>

<template>
  <div v-if="current.resultState === 'complete'">
    {{ current.result.name }} ({{ current.result.email }})
  </div>
</template>
```

The `from` option accepts:

- An object with `__typename` and the key field, for example `{ __typename: 'User', id: '1' }`.
- A reference object like `{ __ref: 'User:1' }`.
- A string cache ID directly, for example `'User:1'`.
- An array of any of the above (see [Working with arrays](#working-with-arrays)).

Like `useQuery`, `useFragment` exposes both a `current` ref (with `result`, `resultState`, `complete`, `missing`) and individual refs. We recommend `current` for the same reason: it narrows the type of `result` based on `resultState`. See [Queries](/data/queries#why-we-recommend-current) for the rationale.

### Working with arrays

Pass an array of entities to read several at once:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useFragment } from '@vue/apollo-composable'

interface UserFieldsFragment { id: string, name: string, email: string }
declare const USER_FRAGMENT: TypedDocumentNode<UserFieldsFragment>
// ---cut---
const { users } = defineProps<{
  users: Array<{ __typename: 'User', id: string }>
}>()

const { current } = useFragment({
  fragment: USER_FRAGMENT,
  from: () => users,
})
```

`current.result` is an array of items where each index lines up with `from`. `resultState` is `'complete'` only when every item is complete.

### Event hook

React to fragment data changes imperatively:

```ts twoslash
import { DocumentNode } from '@apollo/client'
import { useFragment } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => DocumentNode
const USER_FIELDS = gql``
const props = defineProps<{ user: { __typename: 'User', id: string } }>()
// ---cut---
const { onNextState } = useFragment({
  fragment: USER_FIELDS,
  from: props.user,
})

onNextState((state) => {
  console.log('Fragment data changed:', state)
})
```

## Colocating fragments

Colocate fragment definitions with the components that read them. Each component owns its own data requirements, and parent components include those fragments in their queries.

::: tip Recommended: GraphQL Codegen
[GraphQL Codegen](https://the-guild.dev/graphql/codegen) merges fragment definitions across your codebase automatically, removing the need for manual imports and interpolation. See [TypeScript](/data/typescript) for setup.
:::

### Manual fragment colocation

Since `export const` is not allowed in `<script setup>`, use a separate `<script>` block for exports.

::: code-group

```vue [UserAvatar.vue]
<script lang="ts">
import { gql } from '@apollo/client'

export const USER_AVATAR_FRAGMENT = gql`
  fragment UserAvatarFields on User {
    id
    name
    avatarUrl
  }
`
</script>

<script setup lang="ts">
// Component setup code
</script>
```

```vue [UserProfile.vue]
<script lang="ts">
import { gql } from '@apollo/client'
import { USER_AVATAR_FRAGMENT } from './UserAvatar.vue'

export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      bio
      ...UserAvatarFields
    }
  }
  ${USER_AVATAR_FRAGMENT}
`
</script>

<script setup lang="ts">
import { useQuery } from '@vue/apollo-composable'

const { current } = useQuery(GET_USER_PROFILE, { variables: { id: '1' } })
</script>
```

:::

::: tip Fragment naming
Prefix fragment names with the component name (`UserAvatarFields`) so they remain identifiable when many fragments are composed together.
:::

## Fragment registry

You can register fragments globally with `createFragmentRegistry` and reference them by name without interpolation:

::: warning Not for use with GraphQL Codegen
Do not use the fragment registry alongside the `graphql` function from the [GraphQL Codegen client preset](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client). The client preset emits precompiled documents that already include fragment definitions.
:::

```ts
import { ApolloClient, gql, InMemoryCache } from '@apollo/client'
import { createFragmentRegistry } from '@apollo/client/cache'

const client = new ApolloClient({
  cache: new InMemoryCache({
    fragments: createFragmentRegistry(gql`
      fragment UserFields on User {
        id
        name
      }
    `),
  }),
})
```

Now you can spread `UserFields` without importing it:

```ts
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`
```

## Options and result reference

For every available option and method, see:

- [`useFragment.Options`](/api/composable/@vue/namespaces/useFragment/interfaces/Options)
- [`useFragment.Result`](/api/composable/@vue/namespaces/useFragment/interfaces/Result)

## Next steps

- [Data Masking](/data/data-masking) isolates component data requirements.
- [Caching](/caching/overview) explains how the cache stores and identifies entities.
- [TypeScript](/data/typescript) sets up GraphQL Codegen for type-safe fragments.
