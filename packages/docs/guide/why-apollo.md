# Why Apollo Client?

Apollo Client is a comprehensive state-management library for JavaScript. With GraphQL, it manages both local and remote data through a single, normalized cache. Apollo Client is view-layer agnostic, and Vue Apollo provides the official Vue.js integration.

## Declarative data fetching

You write a query, and Apollo Client handles fetching, caching, and updating the UI:

:::: composition-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ todos: { id: string, text: string, completed: boolean }[] }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetTodos {
    todos {
      id
      text
      completed
    }
  }
`)
</script>
```
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ todos: { id: string, text: string, completed: boolean }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery
    :query="gql`
      query GetTodos {
        todos {
          id
          text
          completed
        }
      }
    `"
  >
    <template #data="{ data }">
      {{ data.todos.length }} todos
    </template>
  </ApolloQuery>
</template>
```
::::

You do not need to track loading states by hand, juggle error branches, or update the cache after every mutation. Apollo Client handles all of it.

## Normalized caching

Apollo Client stores responses in a normalized, in-memory cache. When the same data is queried again, it returns from the cache instantly:

```ts twoslash
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
// ---cut---
const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache(),
})
```

Because the cache is normalized by `__typename` + `id`, any query that reads an entity updates automatically when that entity changes elsewhere. A mutation that touches a `User:42` is reflected immediately in every component that displays it.

## Vue-native reactivity

Vue Apollo plugs into Vue's reactivity system.

:::: composition-api
Query variables can be refs, reactive objects, getters, or even per-key reactive maps:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string, name: string } }, { id: string }>
// ---cut---
const userId = ref('1')

const { current } = useQuery(gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`, {
  variables: { id: userId },
})
</script>
```

When `userId` changes, the query re-executes with the new value. No watcher boilerplate required.
::::

:::: components-api
Variables are a prop, so they are reactive for the same reason every other binding is:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string, name: string } }, { id: string }>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
import { ref } from 'vue'

const userId = ref('1')
</script>

<template>
  <ApolloQuery
    :query="gql`
      query User($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    `"
    :variables="{ id: userId }"
  >
    <template #data="{ data }">
      {{ data.user.name }}
    </template>
  </ApolloQuery>
</template>
```

When `userId` changes, the query re-executes with the new value. No refs inside the object, no getters, no watcher boilerplate.
::::

## TypeScript support

With [GraphQL Codegen](/data/typescript), every query, mutation, and result is fully typed end-to-end:

```ts twoslash
import type { TypedDocumentNode } from '@apollo/client'

declare const graphql: (q: string) => TypedDocumentNode<{ user: { id: string, name: string, email: string } }, { id: string }>

// ---cut---
const UserQuery = graphql(`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`)
```

:::: composition-api
`current.result` is typed precisely, including narrowing by `current.resultState` so partial and streaming states are handled safely.
::::

:::: components-api
Passing that document to `<ApolloQuery>` types its `variables` prop, its slot props and its event payloads, and `#data` hands you the fully-resolved shape with no narrowing to write.
::::

## When to use Apollo Client

Apollo Client is a good fit when:

- Your backend speaks GraphQL.
- You need automatic caching with cross-query consistency.
- You want real-time updates through subscriptions, `@defer`, or `@stream`.
- You value TypeScript correctness throughout the stack.

If your backend speaks REST rather than GraphQL, [rstore](https://rstore.dev/) covers much of the same ground for Vue and Nuxt.

For apps that do little caching, something lighter still may be enough. For GraphQL apps with non-trivial caching needs, Apollo Client is the most complete option.
