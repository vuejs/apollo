# Fragments

A [GraphQL fragment](http://graphql.org/learn/queries/#fragments) is a reusable set of fields that can be shared across multiple queries and mutations. Fragments are especially useful for [colocating data requirements](#colocating-fragments) with components.

## Defining Fragments

Define a fragment on a specific type:

```ts
const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    name
    email
  }
`
```

Include the fragment in a query using the spread operator (`...`) and interpolation:

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

## Reading Fragment Data with `useFragment`

The [`useFragment`](/api/composable/functions/useFragment) composable creates a reactive binding to fragment data in the Apollo cache. It watches for changes and updates automatically when the cache changes.

::: warning Cache Identification Required
`useFragment` only works with data that can be identified by the cache. Entities must have a unique cache ID (typically `__typename` + `id`).
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

The `from` option accepts an object with `__typename` and the entity's key fields (usually `id`). You can pass the whole object from a parent query.

### Working with Arrays

`useFragment` supports arrays of entities:

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
  from: () => users, // Array of identifiable entities
})

if (current.value.resultState === 'complete') {
  console.log(current.value.result)
//                          ^?
}
```

When `from` is an array, `current.result` is an array where each item corresponds to the same index in `from`. The result is `complete` only when all items are complete.

### Event Hook

React to fragment data changes:

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

## Colocating Fragments

Colocate fragment definitions with the components that use them. This keeps data requirements close to the UI that renders them.

::: tip Recommended: Use GraphQL Codegen
[GraphQL Codegen](https://the-guild.dev/graphql/codegen) automatically merges fragment definitions from `.graphql` files and components, eliminating the need for manual imports and interpolation. See the [TypeScript page](/data/typescript) for setup instructions.
:::

### Manual Fragment Colocation

Since `export const` is not available in `<script setup>`, use a separate `<script>` block for exports.

Parent components import and include child fragments in their queries:

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
// Component setup code here
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

::: tip Fragment Naming
Prefix fragment names with the component name (e.g., `UserAvatarFields`) to make them easily identifiable when combined with other fragments.
:::

## Fragment Registry

Register fragments globally with `createFragmentRegistry` to use them by name without interpolation.

::: warning Not recommended with GraphQL Codegen
Do not use the fragment registry when using the `graphql` function generated by the [GraphQL Codegen client preset](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client). The client preset creates precompiled GraphQL documents that already include fragment definitions.
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

Then reference fragments by name without `${}` interpolation:

```ts
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`
```

## Options

See [`useFragment.Options`](/api/composable/@vue/namespaces/useFragment/interfaces/Options) for all available options.

## Next Steps

- [Data Masking](/data/data-masking) - Isolate component data requirements with data masking
- [Caching](/caching/overview) - Learn how Apollo Client caches data
- [TypeScript](/data/typescript) - Type-safe fragments with GraphQL Codegen
