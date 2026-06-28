# Why Apollo Client?

Apollo Client is a comprehensive state-management library for JavaScript. With GraphQL, it manages both local and remote data through a single, normalized cache. Apollo Client is view-layer agnostic, and Vue Apollo provides the official Vue.js integration.

## Declarative data fetching

You write a query, and Apollo Client handles fetching, caching, and updating the UI:

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

Vue Apollo plugs into Vue's reactivity system. Query variables can be refs, reactive objects, getters, or even per-key reactive maps:

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

## TypeScript support

With [GraphQL Codegen](/data/typescript), every query, mutation, and result is fully typed end-to-end:

```ts twoslash
import type { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

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

const { current } = useQuery(UserQuery, { variables: { id: '1' } })
```

`current.result` is typed precisely, including narrowing by `current.resultState` so partial and streaming states are handled safely.

## When to use Apollo Client

Apollo Client is a good fit when:

- Your backend speaks GraphQL.
- You need automatic caching with cross-query consistency.
- You want real-time updates through subscriptions, `@defer`, or `@stream`.
- You value TypeScript correctness throughout the stack.

For simple REST APIs or apps that do little caching, lighter alternatives exist. For GraphQL apps with non-trivial caching needs, Apollo Client is the most complete option.
