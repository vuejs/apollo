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

## Reading fragment data

:::: composition-api
[`useFragment`](/api/composable/functions/useFragment) creates a reactive binding to fragment data in the Apollo cache. It watches for changes and updates automatically when the cache changes.
::::

:::: components-api
[`<ApolloFragment>`](/api/components/ApolloFragment) creates a reactive binding to fragment
data in the Apollo cache. It watches for changes and updates automatically when the cache
changes.
::::

::: warning Cache identification required
This only works with entities the cache can identify. Each entity needs a unique cache ID,
normally `__typename` plus the entity's key field (usually `id`).
:::

:::: composition-api
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

Like `useQuery`, `useFragment` exposes both a `current` ref (with `result`, `resultState`, `complete`, `missing`) and individual refs. We recommend `current` for the same reason: it narrows the type of `result` based on `resultState`. See [Queries](/data/queries#two-ways-to-read-the-result) for the rationale.
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

interface UserFieldsFragment { id: string, name: string, email: string }
declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<UserFieldsFragment>
// ---cut---
import { ApolloFragment } from '@vue/apollo-components'

const { user } = defineProps<{ user: { __typename: 'User', id: string } }>()
</script>

<template>
  <ApolloFragment
    :fragment="gql`
      fragment UserFields on User {
        id
        name
        email
      }
    `"
    :from="user"
  >
    <template #data="{ data }">
      {{ data.name }} ({{ data.email }})
    </template>
  </ApolloFragment>
</template>
```

The `from` prop accepts an object with `__typename` and the key field, a reference object
like `{ __ref: 'User:1' }`, or a string cache ID such as `'User:1'`.

Like `<ApolloQuery>`, the component has two modes. Providing `#data` selects the
opinionated one, where `data` has every field the fragment asks for. `#incomplete` covers
the case where the cache is missing some of them, and receives both the partial data and a
`missing` tree describing what is absent:

```vue-html
<ApolloFragment
  :fragment="gql`
    fragment UserFields on User {
      id
      name
      email
    }
  `"
  :from="user"
>
  <template #incomplete="{ data, missing }">
    <p>Partial record for {{ data.id }}</p>
    <pre>{{ missing }}</pre>
  </template>
  <template #data="{ data }">
    {{ data.name }}
  </template>
</ApolloFragment>
```

Using only the default slot gives you raw mode, with the flattened
[`useFragment.Current`](/api/composable/@vue/namespaces/useFragment/interfaces/Current)
state to narrow yourself.
::::

### Working with arrays

:::: composition-api
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
::::

:::: components-api
`<ApolloFragment>` reads a **single** entity. For a list, put it in a `v-for`:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

interface UserFieldsFragment { id: string, name: string, email: string }
declare const UserFields: TypedDocumentNode<UserFieldsFragment>
// ---cut---
import { ApolloFragment } from '@vue/apollo-components'

const { users } = defineProps<{
  users: Array<{ __typename: 'User', id: string }>
}>()
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      <ApolloFragment :fragment="UserFields" :from="user">
        <template #data="{ data }">
          {{ data.name }}
        </template>
      </ApolloFragment>
    </li>
  </ul>
</template>
```

`useFragment`'s array form reports `resultState` as `'complete'` only when *every* entity
is complete, so one entity missing a field downgrades the whole list. One component per
row gives each entity its own complete/incomplete branch, and `#data` stays typed as a
single entity instead of an array.
::::

### Event hook

:::: composition-api
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
::::

:::: components-api
`onNextState` is emitted as `@nextState`:

```vue-html
<ApolloFragment
  :fragment="UserFields"
  :from="user"
  @nextState="state => console.log('Fragment data changed:', state)"
/>
```
::::

## Colocating fragments

Colocate fragment definitions with the components that read them. Each component owns its own data requirements, and parent components include those fragments in their queries.

::: tip Recommended: GraphQL Codegen
[GraphQL Codegen](https://the-guild.dev/graphql/codegen) merges fragment definitions across your codebase automatically, removing the need for manual imports and interpolation. See [TypeScript](/data/typescript) for setup.
:::

### Manual fragment colocation

Since `export const` is not allowed in `<script setup>`, use a separate `<script>` block for exports.

:::: composition-api
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
::::

:::: components-api
The query document is exported from the plain `<script>` block, then rendered with
[`<ApolloQuery>`](/api/components/ApolloQuery) in the template:

::: code-group

```vue [UserAvatar.vue]
<script lang="ts">
import { gql } from '@apollo/client'

export const UserAvatarFields = gql`
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
import { UserAvatarFields } from './UserAvatar.vue'

export const GetUserProfile = gql`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      bio
      ...UserAvatarFields
    }
  }
  ${UserAvatarFields}
`
</script>

<script setup lang="ts">
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery :query="GetUserProfile" :variables="{ id: '1' }">
    <template #data="{ data }">
      {{ data.user.bio }}
    </template>
  </ApolloQuery>
</template>
```

:::
::::

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

:::: composition-api
For every available option and method, see:

- [`useFragment.Options`](/api/composable/@vue/namespaces/useFragment/interfaces/Options)
- [`useFragment.Result`](/api/composable/@vue/namespaces/useFragment/interfaces/Result)
::::

:::: components-api
For every prop, event and slot prop, see:

- [`<ApolloFragment>`](/api/components/ApolloFragment)
- [`useFragment.Options`](/api/composable/@vue/namespaces/useFragment/interfaces/Options), for the `options` prop
- [`useFragment.Result`](/api/composable/@vue/namespaces/useFragment/interfaces/Result), for what a template ref exposes
::::

## Next steps

- [Data Masking](/data/data-masking) isolates component data requirements.
- [Caching](/caching/overview) explains how the cache stores and identifies entities.
- [TypeScript](/data/typescript) sets up GraphQL Codegen for type-safe fragments.
