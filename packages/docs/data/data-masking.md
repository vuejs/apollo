# Data Masking

Data masking prevents components from accessing GraphQL fields they did not explicitly request. The result is loosely coupled components that are more resistant to breaking changes when fragments evolve.

::: tip Recommended: use with GraphQL Codegen
Data masking works best with [GraphQL Codegen](https://the-guild.dev/graphql/codegen) so that masked types match runtime behavior. See [TypeScript](/data/typescript) for setup, including the required [type augmentation](/data/typescript#enabling-data-masking-types).
:::

## The problem masking solves

Consider a parent component that fetches posts and a child component that displays post details:

::: code-group

```ts twoslash [Posts.vue (setup)]
import type { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const POST_DETAILS_FRAGMENT: TypedDocumentNode<{
  title: string
  publishedAt: string
}>
declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{
  posts: Array<{ id: string, title: string, publishedAt: string }>
}>

// ---cut---
const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      ...PostDetailsFragment
    }
  }
  ${POST_DETAILS_FRAGMENT}
`

const { current } = useQuery(GET_POSTS)

// Filter by publishedAt (defined in PostDetailsFragment, not in this query directly)
const published = current.value.result?.posts.filter(post => post.publishedAt)
```

```ts twoslash [PostDetails.vue (setup)]
import type { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{
  title: string
  publishedAt: string
}>

// ---cut---
export const POST_DETAILS_FRAGMENT = gql`
  fragment PostDetailsFragment on Post {
    title
    publishedAt
  }
`
```

:::

The parent reads `publishedAt`, but `publishedAt` is defined in the child's fragment. If `PostDetails` later removes `publishedAt` from its fragment (because it no longer displays it), the parent breaks silently. This implicit dependency between components grows harder to track as the app grows.

## Enabling data masking

Pass `dataMasking: true` to the Apollo Client constructor:

```ts twoslash {6}
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
  cache: new InMemoryCache(),
  dataMasking: true,
})
```

With masking on, fields defined only in a fragment are hidden from queries that include that fragment. The parent can only see the fields it requested directly.

## Reading masked data

Use [`useFragment`](/api/composable/functions/useFragment) inside the component that owns the fragment:

```vue twoslash
<script setup lang="ts">
import { useFragment } from '@vue/apollo-composable'
// ---cut-start---
// eslint-disable-next-line perfectionist/sort-imports
import type { TypedDocumentNode } from '@apollo/client'

declare const POST_DETAILS_FRAGMENT: TypedDocumentNode<{
  title: string
  publishedAt: string
}>
// ---cut-end---

const { post } = defineProps<{
  post: { __typename: 'Post', id: string }
}>()

const { current } = useFragment({
  fragment: POST_DETAILS_FRAGMENT,
  from: () => post,
})
</script>

<template>
  <div v-if="current.resultState === 'complete'">
    <h2>{{ current.result.title }}</h2>
    <p>{{ current.result.publishedAt }}</p>
  </div>
</template>
```

`current.result` only contains the fields defined in the fragment. Parent queries do not leak into it, and sibling fragments do not leak either.

## Fixing the parent component

With data masking on, the parent must explicitly request any fields it needs:

```ts
const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      publishedAt    # Explicit, no longer dependent on the child fragment
      ...PostDetailsFragment
    }
  }
  ${POST_DETAILS_FRAGMENT}
`
```

Now if `PostDetails` removes `publishedAt`, the parent query still works because it requests the field directly.

## The `@unmask` directive

`@unmask` selectively disables masking for a specific fragment spread:

```graphql
query GetPosts {
  posts {
    id
    ...PostDetailsFragment @unmask
  }
}
```

::: warning Use sparingly
`@unmask` is an escape hatch. Prefer adding the needed fields to the parent query explicitly. Reach for `@unmask` only during [incremental adoption](#incremental-adoption).
:::

### Migrate mode

While migrating, `@unmask(mode: "migrate")` logs a development warning whenever you read a field that would otherwise be masked:

```graphql
query GetPosts {
  posts {
    id
    ...PostDetailsFragment @unmask(mode: "migrate")
  }
}
```

This helps you find every implicit dependency before removing the `@unmask` directive.

## What gets masked

| API | Masked |
|-----|--------|
| `useQuery` result | Yes |
| `useMutation` result | Yes |
| `useSubscription` result | Yes |
| `useMutation` `update` callback | No |
| `useMutation` `refetchQueries` callback | No |
| `subscribeToMore` `updateQuery` callback | No |
| Cache APIs (`readQuery`, `readFragment`) | No |

Cache APIs and mutation update callbacks deal with the underlying cache directly, so masking does not apply to them.

## Incremental adoption

You can adopt data masking gradually in an existing codebase:

### 1. Add `@unmask(mode: "migrate")` everywhere

Before enabling `dataMasking`, add `@unmask(mode: "migrate")` to every fragment spread so nothing breaks:

```graphql
query GetPosts {
  posts {
    id
    ...PostDetailsFragment @unmask(mode: "migrate")
  }
}
```

### 2. Enable data masking

```ts
const client = new ApolloClient({
  dataMasking: true,
  // ...
})
```

### 3. Configure TypeScript (if applicable)

If you use TypeScript with GraphQL Codegen:

1. Update your codegen config to emit masked types ([TypeScript setup](/data/typescript#configuration)).
2. Add the type augmentation file ([Enabling data masking types](/data/typescript#enabling-data-masking-types)).

### 4. Refactor components

1. Watch the console for "accessing masked field" warnings.
2. Update components to use `useFragment` for the data they own.
3. Add any required fields to parent queries explicitly.
4. Remove `@unmask` directives when no warnings remain.

## Next steps

- [Fragments](/data/fragments) covers fragment basics and `useFragment`.
- [TypeScript](/data/typescript) sets up GraphQL Codegen for type-safe masked data.
