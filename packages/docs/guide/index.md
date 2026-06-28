# Introduction

**Vue Apollo** is the official [Apollo Client](https://www.apollographql.com/docs/react) integration for [Vue.js](https://vuejs.org/). It lets you manage local and remote GraphQL data through Vue's reactivity system.

<div class="tip custom-block" style="padding-top: 8px">
Ready to try it out? Skip to the <a href="./installation">Installation</a>.
</div>

## Features

- **Declarative data fetching** with [`useQuery`](/api/composable/functions/useQuery.md). Write a query, receive reactive data.
- **Automatic caching**. Apollo's normalized cache serves repeated queries instantly and keeps all queries that read the same entity in sync.
- **Real-time updates** through subscriptions and the `@defer` and `@stream` directives.
- **Full TypeScript support** with GraphQL Codegen integration.
- **Vue-native reactivity**. Variables can be refs, reactive objects, or getters; query results are refs you read from templates.

## Quick example

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

## Compatibility

| Package | Version |
|---------|---------|
| Vue | 3.5+ |
| Apollo Client | 4.1+ |

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
