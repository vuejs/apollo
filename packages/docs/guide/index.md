# Introduction

**Vue Apollo** is the official [Apollo Client](https://www.apollographql.com/docs/react) integration for [Vue.js](https://vuejs.org/). It lets you manage local and remote GraphQL data through Vue's reactivity system.

<div class="tip custom-block" style="padding-top: 8px">
Ready to try it out? Skip to the <a href="./installation">Installation</a>.
</div>

## Two APIs, one library

Vue Apollo ships two packages, and the selector at the top of the sidebar switches this
guide between them:

| Package | What you write | Reach for it when |
|---|---|---|
| [`@vue/apollo-composable`](/api/composable/) | `useQuery` and friends in `<script setup>` | The data feeds script logic: computed values, watchers, `await` for [Suspense](/data/suspense) |
| [`@vue/apollo-components`](/api/components/) | `<ApolloQuery>` and friends in the template | Only the template needs the data, and loading, error and empty branches should be slots |

Both share one client and one cache, so the choice is per component, not per project. See
the [API overview](/api/) for the longer comparison.

## Features

- **Declarative data fetching**. Write a query, receive reactive data.
- **Automatic caching**. Apollo's normalized cache serves repeated queries instantly and keeps all queries that read the same entity in sync.
- **Real-time updates** through subscriptions and the `@defer` and `@stream` directives.
- **Full TypeScript support** with GraphQL Codegen integration.
- **Vue-native reactivity**. Variables can be refs, reactive objects, or getters; query results are refs you read from templates.

## Quick example

:::: composition-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string, name: string }[] }, {}>
// ---cut---
const { current } = useQuery(gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <ul v-else-if="current.resultState === 'complete'">
    <li v-for="user in current.result.users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```
::::

:::: components-api
```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string, name: string }[] }, Record<string, never>>
// ---cut---
import { ApolloQuery } from '@vue/apollo-components'
</script>

<template>
  <ApolloQuery
    :query="gql`
      query GetUsers {
        users {
          id
          name
        }
      }
    `"
  >
    <template #loading>
      Loading...
    </template>
    <template #data="{ data }">
      <ul>
        <li v-for="user in data.users" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```
::::

## Compatibility

| Package | Version |
|---------|---------|
| Vue | 3.5+ |
| Apollo Client | 4.1+ |

Vue 2 is no longer supported. See [What's changed in v5](/migration/whats-changed).

::: warning Apollo Client 4.1 required
Vue Apollo requires `@apollo/client` version 4.1.0 or higher. The features Vue Apollo depends on (improved TypeScript inference, the `DataState` discriminated union, incremental delivery handlers) are only available from 4.1 onward.
:::

## Sponsors

<p align="center">
  <a href="https://guillaume-chau.info/sponsors/" target="_blank">
    <img src='https://akryum.netlify.app/sponsors.svg'/>
  </a>
</p>

<SponsorButton/>
