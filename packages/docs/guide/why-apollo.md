# Why Apollo Client?

Apollo Client is a comprehensive state management library for JavaScript. It enables you to use GraphQL to manage both local and remote data. Apollo Client is view-layer agnostic, and Vue Apollo provides the official Vue.js integration.

## Declarative Data Fetching

Write a query and Apollo Client handles the fetching, caching, and updating your UI:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ todos: { id: string, text: string, completed: boolean }[] }, {}>
// ---cut---
const { result, loading, error } = useQuery(gql`
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

No need to manually track loading states, handle errors, or update the cache, Apollo Client does it all.

## Zero-Config Caching

Apollo Client's normalized cache stores data efficiently and serves repeated queries instantly:

```ts twoslash
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
// ---cut---
const client = new ApolloClient({
  link: new HttpLink({ uri: '/graphql' }),
  cache: new InMemoryCache(),
})
```

When you query the same data again, Apollo Client returns it from the cache without a network request. When data changes, all queries using that data update automatically.

## Vue-Native Reactivity

Vue Apollo integrates seamlessly with Vue's reactivity system. Query variables can be refs, reactive objects, or getter functions:

```vue twoslash
<script setup lang="ts">
// --
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ user: { id: string, name: string } }, { id: string }>
// ---cut---
const userId = ref('1')

// Variables automatically update when userId changes
const { result } = useQuery(gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
    }
  }
`, {
  variables: {
    id: userId,
  },
})
</script>
```

## Excellent TypeScript Support

With [GraphQL Codegen](/data/typescript), all your queries, mutations, and results are fully typed:

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

const { result } = useQuery(UserQuery, { variables: { id: '1' } })
```

## When to Use Apollo Client

Apollo Client is ideal when:

- Your backend uses GraphQL
- You need automatic caching and cache updates
- You want real-time updates via subscriptions
- You value TypeScript support and developer experience

For simple REST APIs with minimal caching needs, lighter alternatives may suffice. But for GraphQL applications, Apollo Client provides the most complete solution.
