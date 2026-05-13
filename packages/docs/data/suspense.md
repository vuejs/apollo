# Suspense

Vue's built-in `<Suspense>` component lets you display a fallback while async dependencies resolve. Vue Apollo plugs into Suspense by exposing `useQuery` as `PromiseLike`, so you can `await` it in your component's setup.

## Async setup

Top-level `await` in `<script setup>` turns the component async. Inside a `<Suspense>`, Vue shows the fallback until that async work completes.

To use this with `useQuery`, prefix the call with `await`:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(gql`
  query GetUsers {
    users {
      id
      name
    }
  }
`)
</script>

<template>
  <ul>
    <li v-for="user in current.result.users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

`await useQuery()` resolves once the initial data is available. As a result, `current.loading` is `false` on the first render and `current.resultState` is already `'complete'`.

## Using Suspense

Wrap your async component in `<Suspense>` to show a loading state until it resolves:

```vue
<script setup>
import UserList from './UserList.vue'
</script>

<template>
  <Suspense>
    <UserList />
    <template #fallback>
      Loading users...
    </template>
  </Suspense>
</template>
```

Vue renders the `#fallback` slot until `UserList`'s async setup resolves.

## Loading state after the initial render

`await useQuery()` only handles the initial render. The query can still enter a loading state later when:

- Variables change and trigger a new fetch.
- The cache is invalidated.
- `refetch()` is called.
- Polling triggers a refresh.

Continue handling `current.loading` in the template for these cases:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const props = defineProps<{ userId: string }>()

const { current } = await useQuery(
  gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
      }
    }
  `,
  {
    variables: () => ({ id: props.userId }),
  },
)
</script>

<template>
  <div v-if="current.loading" class="loading-overlay">
    Updating...
  </div>
  <div v-if="current.resultState === 'complete'">
    {{ current.result.user.name }}
  </div>
</template>
```

## Streaming data with `@defer`

By default, `await useQuery()` resolves as soon as the initial chunk of data arrives. With `@defer` or `@stream` directives, the initial chunk may be incomplete. Set `awaitComplete: true` to wait for all deferred chunks before resolving:

```vue
<script setup lang="ts">
import { gql } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'

const { current } = await useQuery(
  gql`
    query GetUserWithPosts($id: ID!) {
      user(id: $id) {
        id
        name
        ... @defer {
          posts {
            id
            title
          }
        }
      }
    }
  `,
  {
    variables: { id: '1' },
    awaitComplete: true,
  },
)
</script>
```

See [Streaming & @defer](/advanced/streaming) for a deeper treatment.

## Nested async components

`<Suspense>` handles nested async dependencies. If several children each `await useQuery()`, the fallback stays visible until all of them resolve:

```vue
<template>
  <Suspense>
    <Dashboard>
      <UserProfile />
      <RecentActivity />
      <Stats />
    </Dashboard>
    <template #fallback>
      Loading dashboard...
    </template>
  </Suspense>
</template>
```

## Error handling

Suspense does not handle errors directly. Combine it with `onErrorCaptured` or an error-boundary component:

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'
import UserList from './UserList.vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // Stop propagation
})
</script>

<template>
  <div v-if="error" class="error">
    Failed to load: {{ error.message }}
  </div>
  <Suspense v-else>
    <UserList />
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## When Suspense is the right choice

Suspense fits well for:

- Initial page loads where one loading indicator covers everything.
- Route transitions with a unified loading state.
- Dashboard layouts with several data dependencies.

For components that need fine-grained loading control or per-section skeleton states, reading `current.loading` directly gives you the per-query handle you need.

## SSR

Suspense works during server-side rendering. The server awaits each `useQuery` before producing HTML, so the rendered output already contains data. See [SSR Overview](/ssr/overview) for the full picture, including cache extract and restore.

## Next steps

- [Async Components](https://vuejs.org/guide/components/async) for Vue's async component docs.
- [Suspense](https://vuejs.org/guide/built-ins/suspense) for Vue's Suspense docs.
- [Streaming & @defer](/advanced/streaming) for incremental delivery.
- [SSR Overview](/ssr/overview) for server-rendered Suspense.
