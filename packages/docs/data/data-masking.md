# Data Masking

Data masking prevents components from accessing GraphQL fields they didn't explicitly request. This creates loosely coupled components that are more resistant to breaking changes.

::: tip Recommended: Use with GraphQL Codegen
Data masking works best with [GraphQL Codegen](https://the-guild.dev/graphql/codegen) for type-safe masked types. See the [TypeScript page](/data/typescript) for setup instructions.
:::

## The Problem

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

// Filter by publishedAt (defined in PostDetailsFragment)
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

If `PostDetails` removes `publishedAt` from its fragment (because it no longer displays it), the parent component breaks silently. This **implicit dependency** between components becomes harder to track as applications grow.

## Enabling Data Masking

Enable data masking in the Apollo Client constructor:

```ts twoslash {6}
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.example.com/graphql' }),
  cache: new InMemoryCache(),
  dataMasking: true, // Enable data masking
})
```

With data masking enabled, fields defined in fragments are hidden from components that don't own them. The parent component can only access fields it explicitly requests.

## Reading Masked Data

Use [`useFragment`](/api/composable/functions/useFragment) to read masked fragment data in components:

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

const {
  post
} = defineProps<{
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

The `data` from `useFragment` contains only the fields defined in the fragment—not fields from parent queries or sibling fragments.

## Fixing the Parent Component

With data masking, the parent component must explicitly request any fields it needs:

```ts
const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      publishedAt  # Now explicit - won't break if fragment changes
      ...PostDetailsFragment
    }
  }
  ${POST_DETAILS_FRAGMENT}
`
```

Now if `PostDetails` removes `publishedAt` from its fragment, the parent query still works because it requests the field directly.

## The `@unmask` Directive

Use `@unmask` to selectively disable masking for specific fragments:

```graphql
query GetPosts {
  posts {
    id
    ...PostDetailsFragment @unmask
  }
}
```

::: warning Use sparingly
The `@unmask` directive is an escape hatch. Prefer adding needed fields to the parent query explicitly. `@unmask` is primarily useful during [incremental adoption](#incremental-adoption).
:::

### Migrate Mode

During migration, use `@unmask(mode: "migrate")` to get development warnings when accessing would-be masked fields:

```graphql
query GetPosts {
  posts {
    id
    ...PostDetailsFragment @unmask(mode: "migrate")
  }
}
```

This logs warnings in development when you access fields that would be masked, helping you identify implicit dependencies.

## What Gets Masked

Data masking applies to all operation types that read data:

| API | Masked |
|-----|--------|
| `useQuery` result | Yes |
| `useMutation` result | Yes |
| `useSubscription` result | Yes |
| `useMutation` `update` callback | No |
| `useMutation` `refetchQueries` callback | No |
| `subscribeToMore` `updateQuery` callback | No |
| Cache APIs (`readQuery`, `readFragment`) | No |

## Incremental Adoption

For existing applications, adopt data masking incrementally:

### 1. Add `@unmask` to All Fragments

Before enabling data masking, add `@unmask(mode: "migrate")` to all fragment spreads to prevent breaking changes:

```graphql
query GetPosts {
  posts {
    id
    ...PostDetailsFragment @unmask(mode: "migrate")
  }
}
```

### 2. Enable Data Masking

```ts
const client = new ApolloClient({
  dataMasking: true,
  // ...
})
```

### 3. Refactor Components

Gradually refactor components to use `useFragment` and remove `@unmask` directives:

1. Look for console warnings about accessing masked fields
2. Update components to use `useFragment` for their fragment data
3. Add any needed fields explicitly to parent queries
4. Remove `@unmask` when no warnings remain

## Next Steps

- [Fragments](/data/fragments) - Learn about GraphQL fragments and `useFragment`
- [TypeScript](/data/typescript) - Set up GraphQL Codegen for type-safe data masking
