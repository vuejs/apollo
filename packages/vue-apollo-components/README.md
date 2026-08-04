# Apollo and GraphQL for Vue.js (Components API)

[![npm](https://img.shields.io/npm/v/@vue/apollo-components.svg) ![npm](https://img.shields.io/npm/dm/@vue/apollo-components.svg)](https://www.npmjs.com/package/@vue/apollo-components)
[![apollo4](https://img.shields.io/badge/apollo-4.x-blue.svg)](https://www.apollographql.com/)
[![vue3](https://img.shields.io/badge/vue-3-brightgreen.svg)](https://vuejs.org/)

<p align="center">
  <img src="https://cdn-images-1.medium.com/max/400/1*H9AANoofLqjS10Xd5TwRYw.png">
</p>

[:book: Documentation](https://v5.apollo.vuejs.org/)

[:pen: Contributing guide](https://github.com/vuejs/apollo/blob/v5/CONTRIBUTING.md)

[:heart: Sponsor me!](https://github.com/sponsors/Akryum)

```bash
npm i @apollo/client @vue/apollo-composable @vue/apollo-components graphql
pnpm add @apollo/client @vue/apollo-composable @vue/apollo-components graphql
yarn add @apollo/client @vue/apollo-composable @vue/apollo-components graphql
```

Template components built on [`@vue/apollo-composable`](https://www.npmjs.com/package/@vue/apollo-composable),
which is a peer dependency. Both packages talk to the same Apollo Client and the same cache,
so you can mix them freely, even within one component.

## Usage

```vue
<script setup lang="ts">
import { ApolloQuery } from '@vue/apollo-components'
import { GetDogs } from './queries'
</script>

<template>
  <ApolloQuery :query="GetDogs">
    <template #loading>
      Loading…
    </template>
    <template #error="{ error, refetch }">
      {{ error.message }}
      <button @click="refetch()">
        Retry
      </button>
    </template>
    <template #data="{ data }">
      <ul>
        <li v-for="dog in data.dogs" :key="dog.id">
          {{ dog.breed }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```

Import the components directly, as above. Global registration is available but loses the
generic slot-prop types:

```ts
import { VueApolloComponents } from '@vue/apollo-components'

app.use(VueApolloComponents)
```

## Components

| Component | Wraps | Purpose |
|-----------|-------|---------|
| `<ApolloQuery>` | `useQuery` | Fetch data, with `#loading` / `#error` / `#empty` / `#data` slots |
| `<ApolloMutation>` | `useMutation` | Expose `mutate` to the template |
| `<ApolloSubscription>` | `useSubscription` | Stream results, renderless when given no slot |
| `<ApolloSubscribeToMore>` | *(nothing)* | Merge a subscription into the enclosing `<ApolloQuery>` |
| `<ApolloFragment>` | `useFragment` | Read a fragment from the cache, for data masking |

Full prop, event and slot reference: <https://v5.apollo.vuejs.org/api/components/>

## Notable differences from v4

- `disabled` replaces v4's `skip`, and inverts the composable's `enabled`. An absent prop
  means the operation runs.
- `<ApolloQuery>` has two modes. Providing `#data` opts into slot-per-state rendering;
  using only the default slot hands you the raw state. The default slot renders in both.
- `#empty` is also the terminal branch: a query that settles with no result, no error and
  no load in flight renders it. A `disabled` query renders nothing at all.
- Every prop maps to the option of the same name and keeps its `useQuery` default. Nothing
  is toggled on for you based on which slots you pass.
- `<ApolloFragment>` reads a single entity. Use `v-for` for lists, so each row gets its own
  complete/incomplete branch.
- Components cannot suspend. Use `await useQuery(...)` in `<script setup>` for that.

## Sponsors

<p align="center">
  <a href="https://guillaume-chau.info/sponsors/" target="_blank">
    <img src='https://akryum.netlify.app/sponsors.svg'/>
  </a>
</p>
