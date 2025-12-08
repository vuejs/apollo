# Introduction

**Vue Apollo** is the official [Apollo Client](https://www.apollographql.com/docs/react) integration for [Vue.js](https://vuejs.org/). It enables you to manage both local and remote data with GraphQL, using Vue's Composition API.

<div class="tip custom-block" style="padding-top: 8px">
Ready to try it out? Skip to the <a href="./installation">Installation</a>.
</div>

## Features

- **Declarative data fetching** with [`useQuery`](/api/composable/functions/useQuery.md) - write a query and receive reactive data
- **Automatic caching** - respond instantly to queries with cached data
- **Real-time updates** with subscriptions and `@defer` streaming
- **Full TypeScript support** with GraphQL Codegen integration
- **Vue-native reactivity** - variables can be refs, reactive objects, or getters

## Quick Example

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ users: { id: string, name: string }[] }, {}>
// ---cut---
const { result, loading } = useQuery(gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`)
</script>

<template>
  <div v-if="loading">
    Loading...
  </div>
  <ul v-else>
    <li v-for="user in result?.users" :key="user.id">
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

::: warning Apollo Client 4.1 Required
Vue Apollo requires `@apollo/client` version 4.1.0 or higher. This version includes features like improved TypeScript support that Vue Apollo depends on.
:::

## Sponsors

<p align="center">
  <a href="https://guillaume-chau.info/sponsors/" target="_blank">
    <img src='https://akryum.netlify.app/sponsors.svg'/>
  </a>
</p>

<SponsorButton/>
