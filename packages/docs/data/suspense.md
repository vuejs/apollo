# Suspense

Vue's built-in `<Suspense>` component lets you display a loading state while waiting for async dependencies to resolve. Vue Apollo integrates seamlessly with Suspense by supporting `await` in your component's setup.

## Async Setup

In Vue, using top-level `await` in `<script setup>` makes a component async. When wrapped in `<Suspense>`, Vue displays a fallback until the async operation completes.

To use this with `useQuery`, simply prefix it with `await`:

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

When you `await useQuery()`, it resolves only after the initial data is available. This means `current.loading` will **never** be `true` on the initial render.

## Using Suspense

Wrap your async component with `<Suspense>` to show a loading state:

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

The `#fallback` slot is displayed while `UserList` is waiting for its query to complete.

## Important Considerations

### Loading State After Initial Render

While `await useQuery()` ensures data is available on initial render, the query can still enter a loading state later when:

- Variables change, triggering a new fetch
- Cache is invalidated
- `refetch()` is called
- Polling triggers a refresh

You should still handle the `current.loading` state in your template for these cases:

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
  <!-- Handle loading state for subsequent fetches -->
  <div v-if="current.loading" class="loading-overlay">
    Updating...
  </div>
  <div v-if="current.resultState === 'complete'">
    {{ current.result.user.name }}
  </div>
</template>
```

### Streaming Data with `@defer`

By default, `await useQuery()` resolves as soon as initial data arrives. When using `@defer` or `@stream` directives, you may want to wait for all deferred data to arrive before rendering.

Use the [`awaitComplete`](/api/composable/@vue/namespaces/useQuery/interfaces/Options#awaitcomplete) option:

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
    awaitComplete: true, // Wait for deferred data too
  },
)
</script>
```

Learn more about streaming in [Streaming & @defer](/advanced/streaming).

## Nested Async Components

`<Suspense>` handles nested async dependencies automatically. If multiple child components use `await useQuery()`, the fallback is shown until all of them resolve:

```vue
<template>
  <Suspense>
    <Dashboard>
      <!-- All these can use await useQuery() -->
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

## Error Handling

Suspense doesn't handle errors automatically. Combine it with Vue's `onErrorCaptured` hook or an error boundary component:

```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'
import UserList from './UserList.vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // Prevent error from propagating
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

## When to Use Suspense

Suspense works well for:

- **Initial page loads** where you want a unified loading state
- **Route transitions** where you want to show a loading indicator
- **Dashboard layouts** with multiple data dependencies

For components that need fine-grained loading control or skeleton states, using `current.loading` directly may be more appropriate.

## Next Steps

- [Async Components](https://vuejs.org/guide/components/async) - Vue's async component documentation
- [Suspense](https://vuejs.org/guide/built-ins/suspense) - Vue's Suspense documentation
- [Streaming & @defer](/advanced/streaming) - Handle streaming GraphQL responses
- [Queries](/data/queries) - Learn query basics
